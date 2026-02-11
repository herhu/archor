Fastify it is. Below is a **concrete Phase-3 implementation blueprint** you can drop into your repo: **Fastify Access+Gateway**, **MCP worker pool bridging to your existing `archon-mcp` stdio server**, **Postgres schema**, **PM2**, **Nginx (SSE-safe)**, and **CloudWatch logging**.

This is designed to reuse your current `archon-mcp` as-is (compiled to `dist/` and spawned as a child process).

---

## 1) Repo layout (add one new package)

Add a new package (or folder) alongside `archon-mcp/`:

```
herhu-archor/
  archon-mcp/                # existing stdio MCP server
  archon-mcp-remote/         # NEW (Fastify gateway + access)
    src/
      server.ts
      config.ts
      db/
        index.ts
        schema.sql
      auth/
        apiKey.ts
        oidc.ts              # optional now; can add later
      mcp/
        worker.ts
        pool.ts
        mcpRoutes.ts
        protocol.ts
      routes/
        health.ts
        keys.ts
        me.ts
    package.json
    tsconfig.json
    ecosystem.config.cjs     # pm2
```

---

## 2) What this server does

### A) Access API (key issuance)

- `POST /v1/keys` create API key
- `GET /v1/keys` list
- `DELETE /v1/keys/:id` revoke
- `GET /v1/me` basic identity (for now can be “apiKey owner”; later OIDC session)

### B) MCP Remote Gateway

- `GET /mcp/sse` — SSE stream (keepalive + no buffering)
- `POST /mcp` — JSON-RPC messages (calls into MCP worker pool)

Auth for both:

- `Authorization: Bearer sk_live_...` (your product API key)

---

## 3) Postgres schema (minimal MVP)

Create `archon-mcp-remote/src/db/schema.sql`:

```sql
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  oidc_sub text unique,
  created_at timestamptz not null default now()
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null default 'default',
  prefix text not null,
  key_hash text not null,
  scopes jsonb not null default '["archon:read","archon:write"]'::jsonb,
  status text not null default 'active', -- active|revoked
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists api_keys_hash_idx on api_keys(key_hash);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id) on delete set null,
  tool_name text,
  status text not null, -- ok|error|rate_limited|denied
  duration_ms int,
  created_at timestamptz not null default now()
);
```

**Note:** For v1 you can create a single “admin user” row manually and issue keys against it. OIDC can come right after.

---

## 4) Fastify server skeleton (single service: access + gateway)

### `src/config.ts`

```ts
export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbUrl: process.env.DATABASE_URL!,
  keyPepper: process.env.API_KEY_PEPPER!, // random secret
  archonMcpCmd: process.env.ARCHON_MCP_CMD ?? "node",
  archonMcpArgs: (
    process.env.ARCHON_MCP_ARGS ?? "../archon-mcp/dist/index.js"
  ).split(" "),
  workerCount: Number(process.env.MCP_WORKERS ?? 6),
  sseKeepaliveMs: Number(process.env.SSE_KEEPALIVE_MS ?? 15000),
  // hard safety defaults
  allowExecTools: process.env.ALLOW_EXEC_TOOLS === "true", // default false
};
```

### `src/server.ts`

```ts
import Fastify from "fastify";
import { config } from "./config";
import { db } from "./db";
import { registerHealth } from "./routes/health";
import { registerKeys } from "./routes/keys";
import { registerMe } from "./routes/me";
import { registerMcpRoutes } from "./mcp/mcpRoutes";
import { buildWorkerPool } from "./mcp/pool";

async function main() {
  if (!config.dbUrl) throw new Error("DATABASE_URL is required");
  if (!config.keyPepper) throw new Error("API_KEY_PEPPER is required");

  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  // DB
  await db.connect(config.dbUrl);

  // MCP pool
  const pool = await buildWorkerPool({
    size: config.workerCount,
    cmd: config.archonMcpCmd,
    args: config.archonMcpArgs,
    allowExecTools: config.allowExecTools,
  });

  app.addHook("onClose", async () => {
    await pool.close();
    await db.close();
  });

  registerHealth(app);
  registerKeys(app);
  registerMe(app);
  registerMcpRoutes(app, pool);

  await app.listen({ port: config.port, host: "127.0.0.1" });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
```

---

## 5) API key auth middleware (Fastify preHandler)

### `src/auth/apiKey.ts`

```ts
import crypto from "crypto";
import { db } from "../db";
import { config } from "../config";

export type AuthContext = {
  apiKeyId: string;
  userId: string | null;
  scopes: string[];
};

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function authenticateApiKey(req: any): Promise<AuthContext> {
  const hdr = req.headers?.authorization ?? "";
  const s = String(hdr);
  if (!s.startsWith("Bearer "))
    throw Object.assign(new Error("Missing Bearer token"), { statusCode: 401 });

  const token = s.slice("Bearer ".length).trim();
  if (!token.startsWith("sk_"))
    throw Object.assign(new Error("Invalid key format"), { statusCode: 401 });

  const keyHash = sha256Hex(`${config.keyPepper}:${token}`);

  const row = await db.oneOrNone<{
    id: string;
    user_id: string | null;
    scopes: any;
    status: string;
  }>("select id, user_id, scopes, status from api_keys where key_hash=$1", [
    keyHash,
  ]);

  if (!row || row.status !== "active")
    throw Object.assign(new Error("Invalid or revoked key"), {
      statusCode: 401,
    });

  const scopes = Array.isArray(row.scopes) ? row.scopes.map(String) : [];
  return { apiKeyId: row.id, userId: row.user_id, scopes };
}
```

---

## 6) MCP Worker Pool (critical piece)

### Policy: scope → tool allowlist

You already have dangerous tools like demo launching / docker flows in the repo; keep them disabled unless explicitly allowed.

### `src/mcp/protocol.ts` (minimal JSON-RPC helpers)

```ts
export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
};
export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: any;
};

export function ok(id: any, result: any): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}
export function err(
  id: any,
  code: number,
  message: string,
  data?: any,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}
```

### `src/mcp/worker.ts` (spawns one stdio MCP backend)

```ts
import { spawn } from "child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class McpWorker {
  private child: any;
  private client: Client;
  busy = false;

  constructor(
    private cmd: string,
    private args: string[],
  ) {
    this.child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });

    const transport = new StdioClientTransport({
      stdin: this.child.stdin,
      stdout: this.child.stdout,
      stderr: this.child.stderr,
    });

    this.client = new Client(
      { name: "archon-mcp-remote", version: "0.1.0" },
      { capabilities: {} },
    );
    this.client.connect(transport);
  }

  async request(method: string, params?: any) {
    return this.client.request({ method, params });
  }

  async close() {
    try {
      await this.client.close();
    } catch {}
    try {
      this.child.kill("SIGTERM");
    } catch {}
  }
}
```

### `src/mcp/pool.ts` (fixed pool + simple FIFO queue)

```ts
import { McpWorker } from "./worker";

type PoolOpts = {
  size: number;
  cmd: string;
  args: string[];
  allowExecTools: boolean;
};

const TOOL_SCOPE: Record<string, string> = {
  archon_validate_spec: "archon:write",
  archon_generate_project: "archon:write",
  archon_get_schema: "archon:read",
  archon_list_modules: "archon:read",
  archon_generate_from_uml: "archon:write",
  archon_launch_demo: "archon:exec", // keep disabled by default
};

export type DispatchCtx = { scopes: string[] };

export function toolAllowed(
  toolName: string,
  scopes: string[],
  allowExecTools: boolean,
): boolean {
  const required = TOOL_SCOPE[toolName];
  if (!required) return false; // default deny unknown tools
  if (required === "archon:exec" && !allowExecTools) return false;
  return (
    scopes.includes(required) ||
    (required === "archon:read" && scopes.includes("archon:write"))
  );
}

export async function buildWorkerPool(opts: PoolOpts) {
  const workers: McpWorker[] = [];
  for (let i = 0; i < opts.size; i++)
    workers.push(new McpWorker(opts.cmd, opts.args));

  const queue: Array<{
    ctx: DispatchCtx;
    method: string;
    params: any;
    resolve: (v: any) => void;
    reject: (e: any) => void;
  }> = [];

  function getIdle() {
    return workers.find((w) => !w.busy) ?? null;
  }

  async function pump() {
    const w = getIdle();
    if (!w) return;
    const job = queue.shift();
    if (!job) return;

    w.busy = true;
    try {
      // Gate tool calls
      if (job.method === "tools/call") {
        const toolName = String(job.params?.name ?? "");
        if (!toolAllowed(toolName, job.ctx.scopes, opts.allowExecTools)) {
          throw Object.assign(new Error(`Tool denied: ${toolName}`), {
            statusCode: 403,
          });
        }
      }
      const res = await w.request(job.method, job.params);
      job.resolve(res);
    } catch (e) {
      job.reject(e);
    } finally {
      w.busy = false;
      setImmediate(pump);
    }
  }

  async function dispatch(ctx: DispatchCtx, method: string, params?: any) {
    return new Promise((resolve, reject) => {
      if (queue.length > 5000)
        return reject(
          Object.assign(new Error("Server busy"), { statusCode: 429 }),
        );
      queue.push({ ctx, method, params, resolve, reject });
      setImmediate(pump);
    });
  }

  async function close() {
    for (const w of workers) await w.close();
  }

  return { dispatch, close };
}
```

---

## 7) MCP routes (SSE + POST)

### `src/mcp/mcpRoutes.ts`

```ts
import { FastifyInstance } from "fastify";
import { authenticateApiKey } from "../auth/apiKey";
import { config } from "../config";
import type { JsonRpcRequest } from "./protocol";
import { ok, err } from "./protocol";

export function registerMcpRoutes(app: FastifyInstance, pool: any) {
  // SSE channel (simple keepalive; you can later stream progress here)
  app.get("/mcp/sse", async (req, reply) => {
    const auth = await authenticateApiKey(req);

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.flushHeaders?.();

    const timer = setInterval(() => {
      reply.raw.write(`: keepalive\n\n`);
    }, config.sseKeepaliveMs);

    req.raw.on("close", () => clearInterval(timer));

    // Initial hello
    reply.raw.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);

    // keep connection open
    return reply;
  });

  // JSON-RPC endpoint for MCP messages
  app.post("/mcp", async (req, reply) => {
    const auth = await authenticateApiKey(req);
    const body = req.body as JsonRpcRequest;

    if (
      !body ||
      body.jsonrpc !== "2.0" ||
      body.id === undefined ||
      !body.method
    ) {
      return reply.code(400).send(err(null, -32600, "Invalid Request"));
    }

    try {
      const result = await pool.dispatch(
        { scopes: auth.scopes },
        body.method,
        body.params,
      );
      return reply.send(ok(body.id, result));
    } catch (e: any) {
      const code =
        e?.statusCode === 403 ? 403 : e?.statusCode === 429 ? 429 : 500;
      return reply
        .code(code)
        .send(err(body.id, code, e?.message ?? "Internal error"));
    }
  });
}
```

This gives you a working remote gateway surface immediately; you can adapt request/response shapes if you need to align exactly with the OpenAI MCP remote transport expectations, but the internal engine (pool → stdio MCP) is correct.

---

## 8) Key issuance routes

### `src/routes/keys.ts`

```ts
import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { db } from "../db";
import { config } from "../config";

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
function randomKey() {
  // 32 bytes -> 64 hex; you can use base32 if you prefer
  return `sk_live_${crypto.randomBytes(32).toString("hex")}`;
}

export function registerKeys(app: FastifyInstance) {
  // MVP admin-only: protect this later with OIDC session
  app.post("/v1/keys", async (req, reply) => {
    const token = randomKey();
    const prefix = token.slice(0, 16);
    const keyHash = sha256Hex(`${config.keyPepper}:${token}`);

    // For MVP: attach to a default user (create one row manually)
    const user = await db.one<{ id: string }>("select id from users limit 1");
    const row = await db.one<{ id: string }>(
      "insert into api_keys(user_id, prefix, key_hash, scopes) values($1,$2,$3,$4) returning id",
      [
        user.id,
        prefix,
        keyHash,
        JSON.stringify(["archon:read", "archon:write"]),
      ],
    );

    return reply.send({ id: row.id, apiKey: token, prefix });
  });

  app.get("/v1/keys", async (_req, reply) => {
    const rows = await db.manyOrNone(
      "select id, name, prefix, scopes, status, created_at, revoked_at from api_keys order by created_at desc",
    );
    return reply.send(rows);
  });

  app.delete("/v1/keys/:id", async (req, reply) => {
    const { id } = req.params as any;
    await db.none(
      "update api_keys set status='revoked', revoked_at=now() where id=$1",
      [id],
    );
    return reply.send({ ok: true });
  });
}
```

---

## 9) PM2 config

`archon-mcp-remote/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: "archon-mcp-remote",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "postgresql://app:app@127.0.0.1:5432/archon",
        API_KEY_PEPPER: "CHANGE_ME",
        MCP_WORKERS: 6,
        ARCHON_MCP_CMD: "node",
        ARCHON_MCP_ARGS: "../archon-mcp/dist/index.js",
        ALLOW_EXEC_TOOLS: "false",
      },
    },
  ],
};
```

---

## 10) Nginx (SSE-safe) site config

Key SSE bits:

- `proxy_buffering off;`
- long `proxy_read_timeout`
- disable gzip for SSE

Example `/etc/nginx/sites-available/archon.conf`:

```nginx
server {
  listen 80;
  server_name mcp.yourdomain.com;

  # (optional) redirect to https later
  # return 301 https://$host$request_uri;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # general
    proxy_read_timeout 300s;
  }

  location /mcp/sse {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_buffering off;
    gzip off;

    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }
}
```

---

## 11) CloudWatch logs (practical setup)

### App logs

Fastify logs to stdout → use the **CloudWatch Agent** to ship:

- `/home/ec2-user/.pm2/logs/*.log` or systemd journal

If you run PM2, easiest:

- configure CloudWatch Agent to tail PM2 logs.

### Nginx logs

Optionally ship:

- `/var/log/nginx/access.log`
- `/var/log/nginx/error.log`

---

## 12) Hard safety defaults you should keep

Because your toolset includes generation and “demo launch” style operations, keep:

- `ALLOW_EXEC_TOOLS=false` by default (blocks `archon_launch_demo`)
- Add workspace sandboxing before enabling any “write” tool publicly:
  - restrict output paths to `/var/app/workspaces/<key>/<job>` only

---

## Next step (to make this “real” quickly)

Pick one:

**OIDC now:** add Auth0/Keycloak/Cognito and protect `/v1/keys` behind login
