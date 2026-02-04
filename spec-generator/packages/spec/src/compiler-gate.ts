import { DesignSpecV1 } from "./designspec-v1";
import { validateDesignSpecSchema } from "./ajv";
import { validateSemanticV1 } from "./validate-semantic-v1";
import { Diagnostic } from "../../spec-authoring/src/types";
import { normalizeDesignSpecV1 } from "./normalizer";

export function compileValidateV1(spec: unknown): { ok: boolean; diagnostics: Diagnostic[]; normalized?: DesignSpecV1 } {
    const diagnostics: Diagnostic[] = [];

    // AJV schema validation
    const schemaRes = validateDesignSpecSchema(spec);
    if (!schemaRes.ok) {
        for (const e of schemaRes.errors) {
            diagnostics.push({
                code: "ARCHON-AJV-0001",
                level: "error",
                path: e.instancePath || "/",
                message: e.message || "Schema validation error",
                suggestion: e.params ? JSON.stringify(e.params) : undefined
            });
        }
        return { ok: false, diagnostics };
    }

    // At this point spec shape is correct
    const typed = spec as DesignSpecV1;

    // Semantic validation
    const sem = validateSemanticV1(typed);
    diagnostics.push(...sem);

    if (diagnostics.some((d) => d.level === "error")) {
        return { ok: false, diagnostics };
    }

    // Normalization
    const normalized = normalizeDesignSpecV1(typed);
    return { ok: true, diagnostics, normalized };
}
