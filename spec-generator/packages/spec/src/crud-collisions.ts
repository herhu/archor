import { CrudOp, OperationSpec } from "./designspec-v1";

export type Collision = {
    operationIndex: number;
    opMethod: string;
    opPath: string;
    crudOp: CrudOp;
    crudMethod: string;
    crudPath: string;
};

type RouteSig = { method: string; path: string };

function normalizePath(p: string): string {
    // minimal normalization: remove trailing slashes except root
    if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
    return p;
}

function crudRoutes(routeBase: string, crud: CrudOp[]): Array<{ crudOp: CrudOp } & RouteSig> {
    const base = normalizePath("/" + routeBase.replace(/^\/+/, "").replace(/\/+$/, ""));
    const byId = `${base}/:id`;

    const map: Record<CrudOp, RouteSig> = {
        create: { method: "POST", path: base },
        findAll: { method: "GET", path: base },
        findOne: { method: "GET", path: byId },
        update: { method: "PATCH", path: byId },
        delete: { method: "DELETE", path: byId }
    };

    return crud.map((c) => ({ crudOp: c, ...map[c] }));
}

function samePathPattern(a: string, b: string): boolean {
    // Treat "/x/:id" and "/x/:id/" the same
    return normalizePath(a) === normalizePath(b);
}

export function findCrudOperationCollisions(
    serviceRoute: string,
    crud: CrudOp[],
    operations: OperationSpec[]
): Collision[] {
    const collisions: Collision[] = [];

    const crudSigs = crudRoutes(serviceRoute, crud);
    const crudIndex = new Map<string, { crudOp: CrudOp; method: string; path: string }>();

    for (const c of crudSigs) {
        crudIndex.set(`${c.method} ${c.path}`, c);
    }

    operations.forEach((op, idx) => {
        const fullOpPath = normalizePath("/" + serviceRoute.replace(/^\/+/, "").replace(/\/+$/, "") + op.path);
        // Exact match collisions
        const key = `${op.method} ${fullOpPath}`;
        const hit = crudIndex.get(key);
        if (hit) {
            collisions.push({
                operationIndex: idx,
                opMethod: op.method,
                opPath: fullOpPath,
                crudOp: hit.crudOp,
                crudMethod: hit.method,
                crudPath: hit.path
            });
            return;
        }

        // Also check for pattern collisions where op.path == "/:id" etc.
        for (const c of crudSigs) {
            if (op.method === c.method && samePathPattern(fullOpPath, c.path)) {
                collisions.push({
                    operationIndex: idx,
                    opMethod: op.method,
                    opPath: fullOpPath,
                    crudOp: c.crudOp,
                    crudMethod: c.method,
                    crudPath: c.path
                });
            }
        }
    });

    return collisions;
}
