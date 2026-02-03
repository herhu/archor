import { DesignSpecV1 } from "./designspec-v1";
import { Diagnostic } from "../../spec-authoring/src/types";
import { findCrudOperationCollisions } from "./crud-collisions";

function ptr(pathParts: Array<string | number>): string {
    return "/" + pathParts.map(String).join("/");
}

function pushDiag(
    diags: Diagnostic[],
    d: Omit<Diagnostic, "level"> & { level?: Diagnostic["level"] }
) {
    diags.push({ level: d.level ?? "error", ...d });
}

export function validateSemanticV1(spec: DesignSpecV1): Diagnostic[] {
    const diags: Diagnostic[] = [];

    // 1) Domain keys unique
    const domainKeySet = new Set<string>();
    spec.domains.forEach((domain, di) => {
        if (domainKeySet.has(domain.key)) {
            pushDiag(diags, {
                code: "ARCHON-SEM-0001",
                path: ptr(["domains", di, "key"]),
                message: `Duplicate domain key '${domain.key}'. Domain keys must be unique.`
            });
        }
        domainKeySet.add(domain.key);
    });

    // 2) Entity names unique within domain
    spec.domains.forEach((domain, di) => {
        const entitySet = new Set<string>();
        domain.entities.forEach((entity, ei) => {
            if (entitySet.has(entity.name)) {
                pushDiag(diags, {
                    code: "ARCHON-SEM-0002",
                    path: ptr(["domains", di, "entities", ei, "name"]),
                    message: `Duplicate entity name '${entity.name}' in domain '${domain.key}'.`
                });
            }
            entitySet.add(entity.name);
        });
    });

    // 3) Primary key consistency: entity.primaryKey must exist in fields AND be marked primary:true
    spec.domains.forEach((domain, di) => {
        domain.entities.forEach((entity, ei) => {
            const pk = entity.primaryKey;
            const pkField = entity.fields.find((f) => f.name === pk);
            if (!pkField) {
                pushDiag(diags, {
                    code: "ARCHON-SEM-0003",
                    path: ptr(["domains", di, "entities", ei, "primaryKey"]),
                    message: `primaryKey '${pk}' not found among fields for entity '${entity.name}'.`,
                    suggestion: `Add field '{ "name": "${pk}", "type": "int", "primary": true }' or update primaryKey.`
                });
                return;
            }
            if (pkField.primary !== true) {
                pushDiag(diags, {
                    code: "ARCHON-SEM-0004",
                    path: ptr(["domains", di, "entities", ei, "fields", entity.fields.indexOf(pkField), "primary"]),
                    message: `Field '${entity.name}.${pk}' must have primary:true because it is the primaryKey.`,
                    suggestion: `Set primary:true on '${pk}'.`
                });
            }
        });
    });

    // 4) Field names unique within entity
    spec.domains.forEach((domain, di) => {
        domain.entities.forEach((entity, ei) => {
            const fieldSet = new Set<string>();
            entity.fields.forEach((field, fi) => {
                if (fieldSet.has(field.name)) {
                    pushDiag(diags, {
                        code: "ARCHON-SEM-0005",
                        path: ptr(["domains", di, "entities", ei, "fields", fi, "name"]),
                        message: `Duplicate field name '${field.name}' in entity '${entity.name}'.`
                    });
                }
                fieldSet.add(field.name);
            });
        });
    });

    // 5) Service.entity must exist within same domain (schema/type guard already, but keep semantic diag for better UX)
    spec.domains.forEach((domain, di) => {
        const entities = new Set(domain.entities.map((e) => e.name));
        domain.services.forEach((service, si) => {
            if (!entities.has(service.entity)) {
                pushDiag(diags, {
                    code: "ARCHON-SEM-0006",
                    path: ptr(["domains", di, "services", si, "entity"]),
                    message: `Service '${service.name}' references unknown entity '${service.entity}' in domain '${domain.key}'.`
                });
            }
        });
    });

    // 6) Operation path must not collide with CRUD (see section 3)
    spec.domains.forEach((domain, di) => {
        domain.services.forEach((service, si) => {
            const collisions = findCrudOperationCollisions(service.route, service.crud, service.operations ?? []);
            for (const c of collisions) {
                pushDiag(diags, {
                    code: "ARCHON-SEM-0007",
                    path: ptr(["domains", di, "services", si, "operations", c.operationIndex, "path"]),
                    message: `Operation path '${c.opMethod} ${c.opPath}' collides with CRUD route '${c.crudMethod} ${c.crudPath}'.`,
                    suggestion: `Change operation.path or method, or disable the colliding CRUD operation.`
                });
            }
        });
    });

    // 7) Auth rule: public endpoints must explicitly opt out (already in schema), but warn on overly public routes
    // Optional: warn if any operation is public under non-read methods
    spec.domains.forEach((domain, di) => {
        domain.services.forEach((service, si) => {
            (service.operations ?? []).forEach((op, oi) => {
                const isPublic = (op.authz as any).required === false;
                if (isPublic && op.method !== "GET") {
                    pushDiag(diags, {
                        code: "ARCHON-SEM-0008",
                        level: "warn",
                        path: ptr(["domains", di, "services", si, "operations", oi, "authz"]),
                        message: `Public non-GET endpoint '${op.method} ${service.route}${op.path}' is risky.`,
                        suggestion: `Prefer protected scopesAll for write operations.`
                    });
                }
            });
        });
    });

    return diags;
}
