import Ajv from "ajv";
import { DesignSpec } from "./spec";

const ajv = new Ajv({ allErrors: true });

import * as specSchema from "./designspec.schema.json";

export { specSchema };

export function validateSpecSchema(spec: any): string[] {
    const validate = ajv.compile(specSchema);
    const valid = validate(spec);
    const errors = validate.errors?.map(e => `${e.instancePath} ${e.message}`) || [];

    // Explicit version check if schema didn't catch it (though schema pattern should)
    if (spec.version && !spec.version.startsWith("1.")) {
        errors.push("Spec version must start with '1.'");
    }

    return errors;
}

export function validateSpecSemantic(spec: DesignSpec): string[] {
    const errors: string[] = [];
    const domainKeys = new Set<string>();

    spec.domains.forEach(d => {
        if (domainKeys.has(d.key)) {
            errors.push(`Duplicate domain key: ${d.key}`);
        }
        domainKeys.add(d.key);



        // Check authz scopes are arrays
        // Validate service entity references
        // Validate service entity references
        d.services.forEach(s => {
            if (d.entities.length > 1 && !s.entity) {
                errors.push(`Service ${s.name} inside domain ${d.name} is ambiguous. Domain has multiple entities, so service.entity must be specified.`);
            }

            if (s.entity) {
                const entityExists = d.entities.find(e => e.name === s.entity);
                if (!entityExists) {
                    errors.push(`Service ${s.name} references missing entity: ${s.entity}`);
                }
            }

            s.operations?.forEach(op => {
                if (op.authz?.scopesAll) {
                    if (!Array.isArray(op.authz.scopesAll)) {
                        errors.push(`Operation ${op.name} in service ${s.name} has invalid authz.scopesAll (must be array)`);
                    } else {
                        // Enforce naming convention
                        op.authz.scopesAll.forEach(scope => {
                            if (!scope.startsWith(`${d.key}:`)) {
                                errors.push(`Invalid scope "${scope}" in operation "${op.name}". must start with domain key "${d.key}:"`);
                            }
                        });
                    }
                }
            });
        });
    });

    return errors;
}
