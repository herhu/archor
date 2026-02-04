import { DesignSpecV1 } from "./designspec-v1";

/**
 * Normalizes a DesignSpec to ensure deterministic output (canonical form).
 * - Sorts object keys recursively.
 * - Trims strings (optional, can be strict).
 */
export function normalizeDesignSpecV1(spec: DesignSpecV1): DesignSpecV1 {
    return normalizeValue(spec) as DesignSpecV1;
}

function normalizeValue(val: any): any {
    if (Array.isArray(val)) {
        return val.map(normalizeValue);
    }
    if (val !== null && typeof val === "object") {
        const sortedKeys = Object.keys(val).sort();
        const result: any = {};
        for (const k of sortedKeys) {
            result[k] = normalizeValue(val[k]);
        }
        return result;
    }
    if (typeof val === "string") {
        return val.trim();
    }
    return val;
}
