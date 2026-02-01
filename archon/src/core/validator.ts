import Ajv from "ajv";
import { DesignSpec } from "./spec";

const ajv = new Ajv({ allErrors: true });

// Basic checking, will generate a comprehensive schema later if needed.
const specSchema = {
    type: "object",
    required: ["name", "domains"],
    properties: {
        name: { type: "string", minLength: 1 },
        crossCutting: {
            type: "object",
            additionalProperties: false,
            properties: {
                auth: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        jwt: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                issuer: { type: "string" },
                                audience: { type: "string" },
                                jwksUri: { type: "string" }
                            },
                            required: ["issuer", "audience"]
                        }
                    }
                }
            }
        },
        domains: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    name: { type: "string" },
                    key: { type: "string", pattern: "^[a-z0-9-]+$" },
                    entities: {
                        type: "array",
                        minItems: 1,
                        items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                name: { type: "string" },
                                primaryKey: { type: "string" },
                                fields: {
                                    type: "array",
                                    minItems: 1,
                                    items: {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            name: { type: "string" },
                                            type: { enum: ["string", "boolean", "uuid", "int", "float", "timestamp", "json"] },
                                            primary: { type: "boolean" },
                                            nullable: { type: "boolean" }
                                        },
                                        required: ["name", "type"]
                                    }
                                }
                            },
                            required: ["name", "fields"]
                        }
                    },
                    services: {
                        type: "array",
                        minItems: 1,
                        items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                name: { type: "string" },
                                route: { type: "string", pattern: "^[a-z0-9-]+$" },
                                entity: { type: "string" },
                                crud: {
                                    type: "array",
                                    items: { enum: ["create", "findAll", "findOne", "update", "delete"] }
                                },
                                operations: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            name: { type: "string" },
                                            method: { enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
                                            path: { type: "string", pattern: "^/.*" },
                                            authz: {
                                                type: "object",
                                                additionalProperties: false,
                                                properties: {
                                                    required: { type: "boolean" },
                                                    scopesAll: {
                                                        type: "array",
                                                        items: { type: "string", pattern: "^[a-z0-9-]+:[a-z]+$" }
                                                    }
                                                }
                                            },
                                            request: {
                                                type: "object",
                                                additionalProperties: false,
                                                properties: {
                                                    schemaRef: { type: "string" }
                                                }
                                            }
                                        },
                                        required: ["name", "method", "path"]
                                    }
                                }
                            },
                            required: ["name", "route"]
                        }
                    }
                },
                required: ["name", "key"]
            }
        }
    }
};

export function validateSpecSchema(spec: any): string[] {
    const validate = ajv.compile(specSchema);
    const valid = validate(spec);
    if (valid) return [];
    return validate.errors?.map(e => `${e.instancePath} ${e.message}`) || ["Unknown schema error"];
}

export function validateSpecSemantic(spec: DesignSpec): string[] {
    const errors: string[] = [];
    const domainKeys = new Set<string>();

    spec.domains.forEach(d => {
        if (domainKeys.has(d.key)) {
            errors.push(`Duplicate domain key: ${d.key}`);
        }
        domainKeys.add(d.key);

        // Normalize routes (ensure they behave well in semantic sense)
        d.services.forEach(s => {
            if (s.route.startsWith('/')) {
                // Should ideally warn or strip. 
                // For v1 we accept it but maybe warn.
            }
        });

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
                if (op.authz?.scopesAll && !Array.isArray(op.authz.scopesAll)) {
                    errors.push(`Operation ${op.name} in service ${s.name} has invalid authz.scopesAll (must be array)`);
                }
            });
        });
    });

    return errors;
}
