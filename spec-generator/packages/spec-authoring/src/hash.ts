import crypto from "crypto";

export function sha256(input: string): string {
    return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function stableStringify(obj: any): string {
    return JSON.stringify(obj, (_k, v) => {
        if (v && typeof v === "object" && !Array.isArray(v)) {
            return Object.keys(v)
                .sort()
                .reduce((acc: any, key) => {
                    acc[key] = v[key];
                    return acc;
                }, {});
        }
        return v;
    });
}

export function hashObj(obj: any): string {
    return sha256(stableStringify(obj));
}
