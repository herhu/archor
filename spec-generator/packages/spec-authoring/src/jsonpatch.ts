import { JsonPatchApplier } from "./deps";
import { ArchonError } from "./errors";

type PatchOp =
    | { op: "add"; path: string; value: any }
    | { op: "remove"; path: string }
    | { op: "replace"; path: string; value: any };

function decodePointerToken(token: string): string {
    // RFC6901
    return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

function splitPointer(path: string): string[] {
    if (!path.startsWith("/")) {
        throw new ArchonError(`Invalid JSON pointer path: ${path}`, "INVALID_INPUT");
    }
    if (path === "/") return [];
    return path
        .slice(1)
        .split("/")
        .map(decodePointerToken);
}

function isObject(x: any): x is Record<string, any> {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}

function cloneDeep<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}

function getContainer(root: any, tokens: string[]): { parent: any; key: string } {
    if (tokens.length === 0) {
        throw new ArchonError("Patch path cannot target the document root for this operation", "INVALID_INPUT");
    }

    let parent = root;
    for (let i = 0; i < tokens.length - 1; i++) {
        const t = tokens[i];
        if (Array.isArray(parent)) {
            const idx = t === "-" ? parent.length : Number(t);
            if (!Number.isInteger(idx) || idx < 0 || idx >= parent.length) {
                throw new ArchonError(`Invalid array index '${t}' in path`, "INVALID_INPUT");
            }
            parent = parent[idx];
        } else if (isObject(parent)) {
            if (!(t in parent)) {
                throw new ArchonError(`Missing path segment '${t}'`, "INVALID_INPUT");
            }
            parent = parent[t];
        } else {
            throw new ArchonError(`Cannot traverse non-container at '${t}'`, "INVALID_INPUT");
        }
    }

    return { parent, key: tokens[tokens.length - 1] };
}

function opAdd(doc: any, path: string, value: any) {
    const tokens = splitPointer(path);
    const { parent, key } = getContainer(doc, tokens);

    if (Array.isArray(parent)) {
        if (key === "-") {
            parent.push(value);
            return;
        }
        const idx = Number(key);
        if (!Number.isInteger(idx) || idx < 0 || idx > parent.length) {
            throw new ArchonError(`Invalid array index '${key}' for add`, "INVALID_INPUT");
        }
        parent.splice(idx, 0, value);
        return;
    }

    if (isObject(parent)) {
        parent[key] = value;
        return;
    }

    throw new ArchonError(`Add failed at path '${path}'`, "INVALID_INPUT");
}

function opRemove(doc: any, path: string) {
    const tokens = splitPointer(path);
    const { parent, key } = getContainer(doc, tokens);

    if (Array.isArray(parent)) {
        const idx = Number(key);
        if (!Number.isInteger(idx) || idx < 0 || idx >= parent.length) {
            throw new ArchonError(`Invalid array index '${key}' for remove`, "INVALID_INPUT");
        }
        parent.splice(idx, 1);
        return;
    }

    if (isObject(parent)) {
        if (!(key in parent)) {
            throw new ArchonError(`Key '${key}' not found for remove`, "INVALID_INPUT");
        }
        delete parent[key];
        return;
    }

    throw new ArchonError(`Remove failed at path '${path}'`, "INVALID_INPUT");
}

function opReplace(doc: any, path: string, value: any) {
    // Replace requires target to exist. (RFC6902)
    const tokens = splitPointer(path);
    const { parent, key } = getContainer(doc, tokens);

    if (Array.isArray(parent)) {
        const idx = Number(key);
        if (!Number.isInteger(idx) || idx < 0 || idx >= parent.length) {
            throw new ArchonError(`Invalid array index '${key}' for replace`, "INVALID_INPUT");
        }
        parent[idx] = value;
        return;
    }

    if (isObject(parent)) {
        if (!(key in parent)) {
            throw new ArchonError(`Key '${key}' not found for replace`, "INVALID_INPUT");
        }
        parent[key] = value;
        return;
    }

    throw new ArchonError(`Replace failed at path '${path}'`, "INVALID_INPUT");
}

export function applyJsonPatch(candidate: any, patch: PatchOp[]): any {
    const doc = cloneDeep(candidate);

    for (const op of patch) {
        if (!op || typeof op !== "object") {
            throw new ArchonError("Invalid patch operation", "INVALID_INPUT");
        }

        if (op.op === "add") opAdd(doc, op.path, (op as any).value);
        else if (op.op === "remove") opRemove(doc, op.path);
        else if (op.op === "replace") opReplace(doc, op.path, (op as any).value);
        else throw new ArchonError(`Unsupported patch op '${(op as any).op}'`, "INVALID_INPUT");
    }

    return doc;
}

export const realPatchApplier: JsonPatchApplier = {
    apply(candidate: any, patch: any) {
        if (!Array.isArray(patch)) {
            throw new ArchonError("Patch must be an array of RFC6902 ops", "INVALID_INPUT");
        }
        return applyJsonPatch(candidate, patch as PatchOp[]);
    }
};
