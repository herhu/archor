Yep — in **this repo** you’re using the older SDK surface:

- `import { Server } from "@modelcontextprotocol/sdk/server/index.js";` in **both**:
  - `archon-mcp/src/index.ts`
  - `uml-mcp/src/index.ts`

- and you also type your helpers against `Server` (e.g. `archon-mcp/src/tools/index.ts`, `archon-mcp/src/resources/index.ts`).

The upgrade path (and what you already used in the Fastify demo repo) is: **switch from `Server` to `McpServer`**:

- `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";`
  This avoids the deprecated `server/index.js` entrypoint and moves you to the “tool/resource/prompt first” API.

---

## What to change (exactly) in `archon-mcp`

### 1) `archon-mcp/src/index.ts`

**Before** (deprecated):

```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
...
const server = new Server({...}, { capabilities: {...} });
```

**After**:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({
  name: "archon-mcp",
  version: "1.0.0",
});

registerTools(server);
registerResources(server);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

✅ Key point: `McpServer` doesn’t need the second `{ capabilities: ... }` argument you used with `Server`.

---

### 2) `archon-mcp/src/tools/index.ts`

Right now you implement tools by manually handling `ListToolsRequestSchema` + `CallToolRequestSchema` via `server.setRequestHandler(...)`, and the function signature expects `Server`.

Upgrade it to **register tools directly**:

- change the type import from `Server` to `McpServer`
- for each tool: `server.tool(name, { description, inputSchema: z.object(...) }, handler)`

Skeleton (pattern you already documented in your walkthrough):

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
            text: JSON.stringify(
              {
                ok: !schemaErrors.length && !semanticErrors.length,
                schemaErrors,
                semanticErrors,
              },
              null,
              2,
            ),
          },
        ],
        // optional but recommended for “GPT app” callers:
        structuredContent: {
          ok: !schemaErrors.length && !semanticErrors.length,
          schemaErrors,
          semanticErrors,
        },
      };
    },
  );

  // repeat for archon_generate_project, archon_generate_from_uml, etc.
}
```

**Why this matters for “GPT app support”:**

- `structuredContent` is the clean path (your Fastify MCP client already prefers it).

---

### 3) `archon-mcp/src/resources/index.ts`

Same change: stop wiring `ListResourcesRequestSchema`/`ReadResourceRequestSchema` manually and register resources:

Current file uses `Server` + request handlers.

Upgrade shape:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as Archon from "archon";

export function registerResources(server: McpServer) {
  server.resource(
    "designspec-schema-v1",
    "archon://schema/designspec-v1",
    async () => ({
      contents: [
        {
          uri: "archon://schema/designspec-v1",
          mimeType: "application/json",
          text: JSON.stringify(Archon.specSchema, null, 2),
        },
      ],
    }),
  );
}
```

---

### 4) `archon-mcp/src/prompts/*`

Do the same kind of migration: `server.prompt("name", ...)` (or whatever your prompt registration currently does). Your repo has a prompt registration module already; it just needs to accept `McpServer` and call the prompt API rather than request handlers.

---

## What to change in `uml-mcp`

`uml-mcp/src/index.ts` is also using `Server` + request schemas.

Same migration:

- `Server` → `McpServer`
- `setRequestHandler(ListToolsRequestSchema, ...)` → `server.tool(...)`
- `registerPrompts(server)` should accept `McpServer`

---

## Minimal checklist (so you don’t miss a file)

In this repo, search/replace targets are:

- Replace imports:
  - `@modelcontextprotocol/sdk/server/index.js` → `@modelcontextprotocol/sdk/server/mcp.js`

- Replace types:
  - `Server` → `McpServer` in:
    - `archon-mcp/src/tools/index.ts`
    - `archon-mcp/src/resources/index.ts`
    - (and any prompt modules)
