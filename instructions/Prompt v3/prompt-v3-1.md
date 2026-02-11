Alright — given your current state, we can build the **Phase-3 “Access + Remote MCP Gateway”** server cleanly on **EC2 + Postgres + PM2 + Nginx + CloudWatch**, and keep your existing MCP implementation largely intact.

Your current `archon-mcp` is **stdio-transport** and exposes tools like `archon_validate_spec`, `archon_generate_project`, `archon_launch_demo`, etc.
So the core work is: **wrap stdio MCP behind a network gateway** + **add auth/api-key issuance + policy/quota + worker pool**.

---

## 0) What we are building

### Components

1. **Access Server (Auth + API Keys)**

- OIDC login (Auth0/Keycloak/Cognito) for user identity
- Issue **your own API keys** (sell access)
- Validate API keys on every request
- Enforce: plan, scopes, rate limit, concurrency, quota

2. **MCP Gateway (Remote MCP over SSE/HTTP)**

- Exposes endpoints compatible with “remote MCP” style clients
- Auth: `Authorization: Bearer <YOUR_API_KEY>`
- Routes tool calls into a **worker pool** (critical)

3. **Worker Pool (Archon MCP stdio processes)**

- Keep N workers alive (e.g., 4–16)
- Each worker is a spawned `node dist/index.js` for your `archon-mcp` server
- Gateway dispatches calls → worker → returns result

4. **Postgres (internal DB on same EC2 for now)**

- Users, api_keys, usage, plans, audit logs

5. **Nginx (TLS termination + reverse proxy + SSE tuning)**
6. **CloudWatch agent + structured logs**

---

## 1) The non-negotiable design constraint

### Do NOT spawn one `archon-mcp` process per connection.

Because your MCP server is stdio-based and tool execution can be heavy (generation writes files, QA does `npm install/build`, etc.)

**Correct pattern:** long-lived SSE connections are cheap, but _execution_ must be limited via a **worker pool + queue**.

---

## 2) API contract (minimal, practical)

### A) Access Server endpoints

- `GET /health`
- `GET /auth/login` (OIDC redirect)
- `GET /auth/callback` (OIDC)
- `POST /keys` (create key)
- `GET /keys` (list)
- `DELETE /keys/:id` (revoke)
- `GET /me` (current user)

### B) MCP Gateway endpoints (remote)

We’ll implement the standard idea:

- `GET /mcp/sse` (SSE stream)
- `POST /mcp` (JSON-RPC messages; includes tool calls)

Auth:

- `Authorization: Bearer sk_live_xxx...` (your signed API key)

Internally:

- Validate key → load plan/limits → enqueue/dispatch tool call

---

## 3) Postgres schema (minimum viable)

Tables:

- `users`
  - `id (uuid)`, `email`, `oidc_sub`, `created_at`

- `api_keys`
  - `id (uuid)`, `user_id`, `key_hash`, `prefix`, `name`, `scopes jsonb`, `status`, `created_at`, `revoked_at`

- `plans`
  - `id`, `name`, `max_rps`, `max_concurrent_jobs`, `monthly_job_quota`

- `usage_events`
  - `id`, `user_id`, `api_key_id`, `event_type`, `tool_name`, `duration_ms`, `status`, `created_at`

- `audit_log`
  - `id`, `user_id`, `action`, `meta jsonb`, `created_at`

Key storage:

- Store only **hash** (argon2/bcrypt) and **prefix** for display.
- Key format suggestion:
  - `sk_live_<base32random>`
  - Show only prefix: `sk_live_abcd...`

---

## 4) Worker pool mechanics (how tool calls run)

### Worker lifecycle

- Start N workers at process boot (e.g., 8)
- Each worker:
  - spawns the MCP server process: `node archon-mcp/dist/index.js`
  - connects via `@modelcontextprotocol/sdk` client (`StdioClientTransport`) like your verify scripts do
  - keeps a live MCP Client instance

### Dispatch strategy

- Each tool call becomes a job:
  - Pick an idle worker
  - `client.request({ method:"tools/call", params:{ name, arguments }})`
  - Return response

- If no worker available:
  - queue (bounded) or reject with `429 server busy`

### Why this matches your current implementation

Your tools are already registered and callable through MCP (`tools/call`) in `archon-mcp/src/tools/index.ts` — we are simply moving that to a pooled execution model.

---

## 5) EC2 deployment layout (single box, business-minimal)

### Instance

- Start: `t3.large` (2 vCPU, 8GB) or `t4g.large` (ARM cheaper)
- Disk:
  - 50–100GB gp3 (generation writes + npm caches can be real)

### Services on the box

- `nginx` (80/443)
- `api` (access + gateway) on localhost :3000
- `postgres` local (or docker)
- `pm2` to manage node processes
- `cloudwatch-agent`

### File system

- `/var/app` (your node monorepo build)
- `/var/app/workspaces/<jobId>` (generated outputs)
- periodic cleanup job (cron) — delete old workspaces

---

## 6) Nginx config requirements (important for MCP SSE)

For SSE you must ensure:

- `proxy_buffering off;`
- `proxy_read_timeout` high (e.g., 1h)
- `http1.1` keepalive
- pass through `Connection` headers properly

Also: gzip off for SSE route.

---

## 7) Observability (CloudWatch “good enough”)

- App logs: JSON (pino recommended)
- Nginx access logs → CloudWatch (optional)
- Metrics:
  - worker utilization (% busy)
  - queue depth
  - tool latency p50/p95
  - auth failures / rate limit hits

CloudWatch alarms:

- CPU > 80% 5 min
- Disk > 80%
- Memory > 80% (if you install CW agent with mem)
- 5xx rate spike

---

## 8) Build order (do this in sequence)

### Step 1 — Create `packages/access-gateway/` (new service)

- Node + Fastify (or NestJS if you prefer consistency)
- `GET /health`
- Postgres connection
- `api_keys` CRUD

### Step 2 — Add OIDC login

- Use `openid-client` or passport strategy
- Store `users.oidc_sub`
- After login, issue a session cookie (admin UI) or just enable key creation

### Step 3 — API key middleware

- Parse bearer token
- Verify format + hash lookup
- Load plan limits
- Attach `req.auth = { userId, keyId, scopes, plan }`

### Step 4 — Worker pool

- Implement `WorkerPool` class
- Start N workers on boot
- Add bounded queue

### Step 5 — MCP remote endpoints

- Implement `/mcp/sse` and `/mcp` with JSON-RPC message handling
- For `tools/list` and `resources/list`, you can:
  - forward to any worker (read-only), cache for 30s

- For `tools/call`, dispatch to pool

### Step 6 — Nginx + PM2 + CloudWatch

- PM2 runs `access-gateway`
- Nginx reverse proxy to `localhost:3000`
- TLS via ACM (if using ALB) or certbot (if terminating on Nginx)

---

## 9) Decisions I’m making “as senior cloud engineer” for your stated business case

- **EC2 is the best fit** right now because:
  - long-lived SSE connections + worker pool processes
  - local disk workspaces
  - simple ops (pm2 + nginx)

- **Postgres on-box** is OK for v1 to minimize cost/ops.
- **No Lambda** for the gateway because:
  - SSE and long-lived connections are the wrong fit
  - you’ll end up rebuilding stateful worker orchestration anyway

---

## 10) What I need from your repo to “create it” exactly

I can proceed with a concrete folder/package plan and code skeleton that plugs into what you already have, but I need one choice from you:

- Do you want the new server as:
  **Fastify** (leaner for gateway + SSE)?
