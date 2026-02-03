import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../schema/designspec-v1.schema.json";

export function buildAjv() {
    const ajv = new Ajv({
        allErrors: true,
        strict: true,
        allowUnionTypes: false
    });
    addFormats(ajv);
    ajv.addSchema(schema);
    return ajv;
}

export function validateDesignSpecSchema(spec: unknown) {
    const ajv = buildAjv();
    const validate = ajv.getSchema(schema.$id!)!;
    const ok = validate(spec);
    return { ok: !!ok, errors: validate.errors ?? [] };
}
