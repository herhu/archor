Cool — **(2) new package** is the right call. Here’s the exact implementation plan to make **both `archon-mcp` and `uml-mcp` accessible to GPT over HTTP** while **keeping Claude stdio working**, and at the same time **upgrading away from the deprecated** `@modelcontextprotocol/sdk/server/index.js` import.

I’m going to assume your monorepo already has `archon-mcp/` and `uml-mcp/` packages like in the uploaded files.

---

# 1) Create a new package: `mcp-gateway-fastify/`

## `mcp-gateway-fastify/package.json`

```json
{
  "name": "mcp-gateway-fastify",
  "private": true,
  "type": "module",
  "version": "0.1.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "node --watch dist/index.js",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "fastify": "^4.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@fastify/static": "^7.0.0",
    "zod": "^3.0.0",
    "archon-mcp": "workspace:*",
    "uml-mcp": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

> Notes:
>
> - You already have a working Fastify + MCP bridge pattern in the demo repo (the `/mcp` hijack + `StreamableHTTPServerTransport`). We’re reusing that pattern, but mounting **multiple** MCP servers.

## `mcp-gateway-fastify/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

# 2) Implement the multi-MCP HTTP gateway (Fastify)

## `mcp-gateway-fastify/src/index.ts`

```ts
import Fastify from "fastify";
import { archonMcpRoute } from "./routes/archon.js";
import { umlMcpRoute } from "./routes/uml.js";
import { allMcpRoute } from "./routes/all.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

async function main() {
  const app = Fastify({ logger: { level: LOG_LEVEL } });

  app.get("/health", async () => ({ ok: true }));

  // Mount each MCP server on its own route:
  await app.register(archonMcpRoute, { prefix: "/mcp/archon" });
  await app.register(umlMcpRoute, { prefix: "/mcp/uml" });
  await app.register(allMcpRoute, { prefix: "/mcp/all" });

  await app.listen({ port: PORT, host: HOST });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
```

---

# 3) Add a reusable “HTTP bridge” (the critical piece)

This is the same core idea as your existing demo: Fastify route → `reply.hijack()` → raw Node `req/res` → `StreamableHTTPServerTransport.handleRequest()` with per-session routing.

## `mcp-gateway-fastify/src/mcp/createMcpHttpBridge.ts`

```ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

type McpServerFactory = () => McpServer;

export function createMcpHttpBridge(createServer: McpServerFactory) {
  // Keep sessions per-route so Archon/UML sessions never collide.
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  function getSessionId(req: IncomingMessage): string | undefined {
    const raw = req.headers["mcp-session-id"];
    if (Array.isArray(raw)) return raw[0];
    return raw;
  }

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const sessionId = getSessionId(req);

    if (sessionId && sessions.has(sessionId)) {
      const transport = sessions.get(sessionId)!;
      await transport.handleRequest(req, res);
      return;
    }

    // New session
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
      onsessionclosed: (id) => sessions.delete(id),
    });

    // When the transport chooses a session id, store it so follow-up calls route correctly.
    transport.onSessionId?.((id: string) => sessions.set(id, transport));

    await server.connect(transport);
    await transport.handleRequest(req, res);
  }

  return { handle };
}
```

> If your SDK version doesn’t have `transport.onSessionId`, you can store the session after the first request by reading the response header `mcp-session-id`. The demo you shared already had a working session map approach; adapt that exact pattern if needed.

---

# 4) Mount each MCP server as its own Fastify plugin

## `mcp-gateway-fastify/src/routes/archon.ts`

```ts
import type { FastifyPluginAsync } from "fastify";
import { createMcpHttpBridge } from "../mcp/createMcpHttpBridge.js";
import { createArchonServer } from "archon-mcp";

export const archonMcpRoute: FastifyPluginAsync = async (app) => {
  const bridge = createMcpHttpBridge(createArchonServer);

  // IMPORTANT: do not let Fastify consume the stream before MCP transport sees it.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.all("/", async (req, reply) => {
    reply.hijack();
    await bridge.handle(req.raw, reply.raw);
  });
};
```

## `mcp-gateway-fastify/src/routes/uml.ts`

```ts
import type { FastifyPluginAsync } from "fastify";
import { createMcpHttpBridge } from "../mcp/createMcpHttpBridge.js";
import { createUmlServer } from "uml-mcp";

export const umlMcpRoute: FastifyPluginAsync = async (app) => {
  const bridge = createMcpHttpBridge(createUmlServer);

  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.all("/", async (req, reply) => {
    reply.hijack();
    await bridge.handle(req.raw, reply.raw);
  });
};
```

## `mcp-gateway-fastify/src/routes/all.ts`

```ts
import type { FastifyPluginAsync } from "fastify";
import { createMcpHttpBridge } from "../mcp/createMcpHttpBridge.js";
import { createArchonServer } from "archon-mcp";
import { createUmlServer } from "uml-mcp";

export const allMcpRoute: FastifyPluginAsync = async (app) => {
  const bridge = createMcpHttpBridge(() => {
    // Option A (recommended): one combined server where you register both tool sets.
    // We implement this by exporting "registerTools/registerResources/registerPrompts"
    // from each package, and composing them here.
    //
    // If you don’t want to export registrars, you can create a third package "all-mcp"
    // that does the composition.
    throw new Error("Implement combined server composition (see step 6).");
  });

  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.all("/", async (req, reply) => {
    reply.hijack();
    await bridge.handle(req.raw, reply.raw);
  });
};
```

You can ship without `/mcp/all` initially — the key is `/mcp/archon` + `/mcp/uml`.

---

# 5) Upgrade `archon-mcp` to modern SDK and export a server factory

Right now you’re importing the deprecated server entrypoint in `archon-mcp/src/index.ts`.

## Add: `archon-mcp/src/server.ts`

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

export function createArchonServer() {
  const server = new McpServer({
    name: "archon-mcp",
    version: "1.0.0",
  });

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}
```

## Update: `archon-mcp/src/index.ts` (stdio entrypoint stays for Claude)

```ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createArchonServer } from "./server.js";

async function main() {
  const server = createArchonServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Update: `archon-mcp/src/tools/index.ts` signature

This file currently types against `Server` and uses request schemas.
Change it to accept `McpServer` and register tools via `server.tool(...)`.

**Minimal migration strategy (fast + safe):**

- Keep your **existing tool names** like `archon_validate_spec` so Claude configs don’t break.
- Register the same names under MCP tool registry.

Example pattern:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as Archon from "archon";

export function registerTools(server: McpServer) {
  server.tool(
    "archon_validate_spec",
    {
      description: "Validate an Archon DesignSpec v1 JSON object.",
      inputSchema: z.object({ spec: z.any() }),
    },
    async ({ spec }) => {
      const schemaErrors = Archon.validateSpecSchema(spec);
      const semanticErrors = schemaErrors.length
        ? []
        : Archon.validateSpecSemantic(spec);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ schemaErrors, semanticErrors }, null, 2),
          },
        ],
        structuredContent: { schemaErrors, semanticErrors },
      };
    },
  );

  // repeat for:
  // archon_validate_uml, archon_generate_project, archon_generate_from_uml, archon_create_zip
}
```

Do the same for `resources` and `prompts` modules: accept `McpServer` and use the modern registration methods instead of `setRequestHandler(...)`.

---

# 6) Upgrade `uml-mcp` similarly and export `createUmlServer()`

`uml-mcp/src/index.ts` currently uses the deprecated `Server` import.

## Add: `uml-mcp/src/server.ts`

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";

export function createUmlServer() {
  const server = new McpServer({ name: "uml-mcp", version: "1.0.0" });
  registerTools(server);
  registerPrompts(server);
  return server;
}
```

## Update: `uml-mcp/src/index.ts` to remain stdio for Claude

```ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createUmlServer } from "./server.js";

async function main() {
  const server = createUmlServer();
  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Update: `uml-mcp/src/tools.ts` to use `server.tool(...)`

That file currently uses request handler schemas.
Convert each tool into a `server.tool("name", { inputSchema }, handler)`.

---

# 7) Export factories from each package (so gateway can import them)

In each package `package.json`, ensure the `exports` map exposes the factory.

### `archon-mcp/package.json` (add exports)

```json
{
  "type": "module",
  "exports": {
    ".": "./dist/server.js",
    "./stdio": "./dist/index.js"
  }
}
```

### `uml-mcp/package.json`

```json
{
  "type": "module",
  "exports": {
    ".": "./dist/server.js",
    "./stdio": "./dist/index.js"
  }
}
```

So the gateway can do:

```ts
import { createArchonServer } from "archon-mcp";
import { createUmlServer } from "uml-mcp";
```

…and Claude can still run the stdio entry if needed.

---

# 8) About `/mcp/all` (single combined endpoint)

You have two options:

### Option A (cleanest)

Export `registerTools/registerResources/registerPrompts` from both packages, and in the gateway create:

```ts
const server = new McpServer({ name: "all-mcp", version: "1.0.0" });
registerArchonTools(server);
registerArchonResources(server);
registerArchonPrompts(server);
registerUmlTools(server);
registerUmlPrompts(server);
return server;
```

### Option B (simplest shipping)

Skip `/mcp/all`. GPT will call:

- `/mcp/archon` for Archon tools
- `/mcp/uml` for UML tools
  This already meets your requirement: “all of them accessible from GPT.”

---

## What you’ll end up with

- **Claude**: unchanged behavior (still stdio servers), but now on modern SDK.
- **GPT**: call tools over HTTP:
  - `POST https://.../mcp/archon`
  - `POST https://.../mcp/uml`

And you’ve removed the deprecated import everywhere (`@modelcontextprotocol/sdk/server/index.js`).

Perfect — the `package.json` details clarify the key constraint:

- **Claude today**: runs **stdio** MCP servers.
- **GPT**: needs **HTTP (Streamable) MCP**.
- **Current internal flow**: **archon-mcp triggers uml-mcp** (so Archon is orchestrating UML transformation).

You can support **both Claude + GPT** without breaking that flow by doing **two things**:

1. **Upgrade both servers to `McpServer` (remove deprecated `Server` import).**
2. **Add a new Fastify gateway package that exposes BOTH servers over HTTP**, while keeping stdio entrypoints for Claude.

The only tricky part is your “archon triggers uml” flow — you must avoid making Archon call UML through a transport (stdio/HTTP) from inside the same process. The clean solution is: **make `uml-mcp` export a pure function / library API**, and have `archon-mcp` call that directly.

---

## 1) Fix the “archon triggers uml” flow (do it as a library call)

Right now `archon-mcp` depends on `uml-mcp` (file:../uml-mcp). That’s fine — but instead of “calling the UML MCP server”, do this:

### In `uml-mcp`, extract core logic

Create:

**`uml-mcp/src/core/transform.ts`**

```ts
export async function transformUmlToArchonSpec(input: { uml: string }) {
  // move your existing UML → spec logic here
  // return the spec JSON + any diagnostics
  return {
    spec: {
      /*...*/
    },
    warnings: [],
    errors: [],
  };
}
```

### In `uml-mcp`, MCP tool handler calls that function

Your tool becomes a thin wrapper around `transformUmlToArchonSpec`.

### In `archon-mcp`, call the function directly

In whatever Archon tool “triggers UML” (e.g. generate-from-uml), do:

```ts
import { transformUmlToArchonSpec } from "uml-mcp/core";
```

This avoids:

- running nested MCP servers
- trying to call stdio from inside stdio
- trying to call HTTP from inside a tool handler

**Result:** the flow stays “archon triggers uml”, but it’s _in-process_ and deterministic.

---

## 2) Upgrade away from deprecated import in BOTH packages

You currently have the deprecated import:
`@modelcontextprotocol/sdk/server/index.js` (Server)
You should move to:
`@modelcontextprotocol/sdk/server/mcp.js` (McpServer)

### Add a server factory export in each package

#### `archon-mcp/src/server.ts`

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

export function createArchonServer() {
  const server = new McpServer({ name: "archon-mcp", version: "1.0.0" });
  registerTools(server);
  registerResources(server);
  registerPrompts(server);
  return server;
}
```

#### `archon-mcp/src/index.ts` (stdio entrypoint for Claude)

```ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createArchonServer } from "./server.js";

const server = createArchonServer();
await server.connect(new StdioServerTransport());
```

Do the same pattern for UML:

#### `uml-mcp/src/server.ts`

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";

export function createUmlServer() {
  const server = new McpServer({ name: "uml-mcp", version: "1.0.0" });
  registerTools(server);
  registerPrompts(server);
  return server;
}
```

#### `uml-mcp/src/index.ts` (stdio entrypoint)

```ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createUmlServer } from "./server.js";

const server = createUmlServer();
await server.connect(new StdioServerTransport());
```

### Update tool registration style

Your current code likely uses `server.setRequestHandler(ListToolsRequestSchema...)`.
With `McpServer` you should register tools via `server.tool(name, { inputSchema }, handler)`.

This is mandatory for a clean “works the same over stdio and HTTP” setup.

---

## 3) Adjust `package.json` exports so gateway can import factories (and Archon can import UML core)

Right now both packages only expose `main: dist/index.js`. That’s not enough.

### `uml-mcp/package.json` changes (add exports)

```json
{
  "name": "uml-mcp",
  "type": "module",
  "main": "dist/index.js",
  "exports": {
    ".": "./dist/server.js",
    "./stdio": "./dist/index.js",
    "./core": "./dist/core/transform.js"
  }
}
```

### `archon-mcp/package.json` changes

```json
{
  "name": "archon-mcp",
  "type": "module",
  "main": "dist/index.js",
  "exports": {
    ".": "./dist/server.js",
    "./stdio": "./dist/index.js"
  }
}
```

Now:

- Fastify gateway can import `createArchonServer` and `createUmlServer`
- Archon can import UML transformation core: `import { transformUmlToArchonSpec } from "uml-mcp/core"`

---

## 4) New package: `mcp-gateway-fastify` (GPT access over HTTP)

This package will:

- run Fastify
- mount `/mcp/archon` and `/mcp/uml` (each backed by its own `createMcpHttpBridge(createXServer)`)

So GPT can access everything.

**Important:** even though Archon internally calls UML core logic, you STILL expose UML MCP over HTTP for GPT users who want to call UML tools directly.

---

## 5) Dependency cleanup (strong recommendation)

Your current `archon-mcp` depends on `uml-mcp` (file:../uml-mcp). That’s OK, but **make sure it depends on UML only for the core transform**, not for “running the UML server”.

So:

- Keep the dependency, but only import from `uml-mcp/core` in Archon tools.
- Do **not** start/connect an UML MCP server from inside Archon.

---
