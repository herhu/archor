import Ajv from "ajv";
import { DesignSpec } from "./spec";

const ajv = new Ajv({ allErrors: true });

// Basic checking, will generate a comprehensive schema later if needed.
const specSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1 },
        domains: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    key: { type: "string", pattern: "^[a-z0-9-]+$" },
                    entities: { type: "array" },
                    services: { type: "array" }
                },
                required: ["name", "key"]
            }
        }
    },
    required: ["name", "domains"]
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
        d.services.forEach(s => {
            s.operations?.forEach(op => {
                if (op.authz?.scopesAll && !Array.isArray(op.authz.scopesAll)) {
                    errors.push(`Operation ${op.name} in service ${s.name} has invalid authz.scopesAll (must be array)`);
                }
            });
        });
    });

    return errors;
}
