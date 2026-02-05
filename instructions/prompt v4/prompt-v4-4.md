Perfect. With your uploaded `spec.ts`, `validator.ts`, `generator.ts`, we can do **1, 2, 3** concretely, *grounded in what you already built*.

Key reality from your code:

* Your current `DesignSpec` is already a working “compiler input” (domains → entities/services → controllers/DTOs) and generation is deterministic.
* Validation is AJV-based already.
* Generator already has clean phases: scaffold → platform → domains → auth → docs → scripts.

So Phase 2 is an **evolution**, not a rewrite.

---

# 1) DesignSpec v1 JSON Schema (versioned, platform + domains + modules)

## Design goals

* Keep 100% compatibility with your current shape:

  * `name`, `domains`, `crossCutting.auth.jwt`, domain `key`, entity fields types, service CRUD + operations/authz
* Add:

  * `version`
  * `platform` toggles (docker/swagger/throttling/bodyLimit/apiPrefix)
  * `modules[]` injections (redis/queue/payments) with strict sub-schemas

## Proposed DesignSpec v1 (TypeScript shape)

```ts
export interface DesignSpecV1 {
  version: "1.0";
  project: {
    name: string;
    apiPrefix?: string; // default "api/v1"
    port?: number; // default 3000
  };

  platform?: {
    docker?: boolean;          // default true
    swagger?: boolean;         // default true
    throttling?: { ttl: number; limit: number };
    maxBodySize?: string;      // default "1mb"
    cors?: { origins?: string[]; allowDevAll?: boolean };
  };

  crossCutting?: {
    auth?: {
      jwt?: {
        issuer: string;
        audience: string;
        jwksUri?: string;
        defaultScopes?: string; // space separated, keep for compat
      };
    };
  };

  domains: Domain[]; // reuse your current Domain
  modules?: ModuleInjection[]; // new
  assumptions?: string[];
}
```

### Compatibility bridge

You can keep `DesignSpec` internally and add:

* `normalizeToV1(oldSpec)` that wraps:

  * `project.name = oldSpec.name`
  * `domains = oldSpec.domains`
  * `crossCutting = oldSpec.crossCutting`
  * apply defaults for `platform`

This lets you ship v1 without breaking CLI usage.

---

## JSON Schema: `designspec.v1.schema.json` (MVP strict)

This is the schema you’ll publish as an MCP **Resource** (`archon://schema/designspec-v1`) and use in AJV.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "archon://schema/designspec-v1",
  "title": "Archon DesignSpec v1",
  "type": "object",
  "required": ["version", "project", "domains"],
  "additionalProperties": false,
  "properties": {
    "version": { "type": "string", "enum": ["1.0"] },

    "project": {
      "type": "object",
      "required": ["name"],
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "apiPrefix": { "type": "string", "minLength": 1, "default": "api/v1" },
        "port": { "type": "integer", "minimum": 1, "maximum": 65535, "default": 3000 }
      }
    },

    "platform": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "docker": { "type": "boolean", "default": true },
        "swagger": { "type": "boolean", "default": true },
        "maxBodySize": { "type": "string", "default": "1mb" },
        "throttling": {
          "type": "object",
          "additionalProperties": false,
          "required": ["ttl", "limit"],
          "properties": {
            "ttl": { "type": "integer", "minimum": 1, "default": 60 },
            "limit": { "type": "integer", "minimum": 1, "default": 100 }
          }
        },
        "cors": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "origins": { "type": "array", "items": { "type": "string" } },
            "allowDevAll": { "type": "boolean", "default": true }
          }
        }
      }
    },

    "crossCutting": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "auth": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "jwt": {
              "type": "object",
              "additionalProperties": false,
              "required": ["issuer", "audience"],
              "properties": {
                "issuer": { "type": "string", "minLength": 1 },
                "audience": { "type": "string", "minLength": 1 },
                "jwksUri": { "type": "string" },
                "defaultScopes": { "type": "string" }
              }
            }
          }
        }
      }
    },

    "domains": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/domain" }
    },

    "modules": {
      "type": "array",
      "items": { "$ref": "#/$defs/moduleInjection" }
    },

    "assumptions": {
      "type": "array",
      "items": { "type": "string" }
    }
  },

  "$defs": {
    "domain": {
      "type": "object",
      "required": ["name", "key", "entities", "services"],
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "key": { "type": "string", "pattern": "^[a-z0-9-]+$" },
        "entities": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/$defs/entity" }
        },
        "services": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/$defs/service" }
        }
      }
    },

    "entity": {
      "type": "object",
      "required": ["name", "fields"],
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "primaryKey": { "type": "string" },
        "fields": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/$defs/field" }
        }
      }
    },

    "field": {
      "type": "object",
      "required": ["name", "type"],
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "type": { "enum": ["string", "boolean", "uuid", "int", "float", "timestamp", "json"] },
        "primary": { "type": "boolean" },
        "nullable": { "type": "boolean" }
      }
    },

    "service": {
      "type": "object",
      "required": ["name", "route"],
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "route": { "type": "string", "pattern": "^[a-z0-9-]+$" },
        "entity": { "type": "string" },
        "crud": {
          "type": "array",
          "items": { "enum": ["create", "findAll", "findOne", "update", "delete"] }
        },
        "operations": {
          "type": "array",
          "items": { "$ref": "#/$defs/operation" }
        }
      }
    },

    "operation": {
      "type": "object",
      "required": ["name", "method", "path"],
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "method": { "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "path": { "type": "string", "pattern": "^/.*" },
        "authz": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "required": { "type": "boolean" },
            "scopesAll": {
              "type": "array",
              "items": { "type": "string", "pattern": "^[a-z0-9-]+:[a-z]+$" }
            }
          }
        },
        "request": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "schemaRef": { "type": "string" }
          }
        }
      }
    },

    "moduleInjection": {
      "type": "object",
      "required": ["type", "config"],
      "additionalProperties": false,
      "properties": {
        "type": {
          "type": "string",
          "enum": ["cache.redis", "queue.bullmq"]
        },
        "config": { "type": "object" }
      },
      "allOf": [
        {
          "if": { "properties": { "type": { "const": "cache.redis" } } },
          "then": { "$ref": "#/$defs/moduleRedis" }
        },
        {
          "if": { "properties": { "type": { "const": "queue.bullmq" } } },
          "then": { "$ref": "#/$defs/moduleBullmq" }
        }
      ]
    },

    "moduleRedis": {
      "type": "object",
      "properties": {
        "config": {
          "type": "object",
          "required": ["redisUrlEnv"],
          "additionalProperties": false,
          "properties": {
            "redisUrlEnv": { "type": "string", "default": "REDIS_URL" }
          }
        }
      }
    },

    "moduleBullmq": {
      "type": "object",
      "properties": {
        "config": {
          "type": "object",
          "required": ["queueName", "redisUrlEnv"],
          "additionalProperties": false,
          "properties": {
            "queueName": { "type": "string", "minLength": 1 },
            "redisUrlEnv": { "type": "string", "default": "REDIS_URL" }
          }
        }
      }
    }
  }
}
```

**How this fits your current validator:** you already use AJV (`validator.ts`) and return readable error strings. Great — swap `specSchema` for this v1 schema and keep `validateSpecSemantic` (but update for v1 paths). Your current semantic checks (domain key uniqueness, scope prefix rule) are good.

---

# 2) Module injection contract (redis + bullmq) + wiring rules

This is the **core of Option 1**: start platform, then inject capabilities.

## Module injection contract (what each module must provide)

Each module package has:

1. `module.schema.json` (spec fragment)
2. `templates/` for code
3. `wiring.ts` (deterministic patch operations)

### Wiring operations (the only allowed mutation types)

You want deterministic, reviewable changes. Define a patch DSL:

```ts
type PatchOp =
  | { op: "writeFile"; path: string; content: string }
  | { op: "appendFile"; path: string; content: string }
  | { op: "jsonMerge"; path: string; merge: any }           // package.json etc.
  | { op: "tsAddImport"; path: string; symbol: string; from: string }
  | { op: "tsAddToArray"; path: string; arraySelector: string; element: string }
  | { op: "yamlMerge"; path: string; merge: any }
  | { op: "envAdd"; path: string; key: string; value: string };
```

This prevents “LLM edits code freely”. It’s a compiler, not vibe coding.

---

## Module A: `cache.redis`

### Spec fragment

```json
{ "type": "cache.redis", "config": { "redisUrlEnv": "REDIS_URL" } }
```

### Generated artifacts

* `src/shared/redis/redis.module.ts`
* `src/shared/redis/redis.service.ts`
* `src/shared/cache/cache.interceptor.ts` (optional)
* `src/shared/cache/cache.decorator.ts` (optional)

### Wiring rules

* Add to `AppModule.imports`: `RedisModule`
* Add to `.env.example` + `.env.docker`: `REDIS_URL=redis://redis:6379`
* Update `docker-compose.yml`: add `redis` service
* Optional: add docs snippet in README

---

## Module B: `queue.bullmq`

### Spec fragment

```json
{
  "type": "queue.bullmq",
  "config": { "queueName": "default", "redisUrlEnv": "REDIS_URL" }
}
```

### Generated artifacts

* `src/shared/queue/queue.module.ts`
* `src/shared/queue/queue.service.ts`
* `src/workers/<queueName>.worker.ts`
* Optional: example producer endpoint

### Wiring rules

* Add `QueueModule` to `AppModule.imports`
* Ensure redis is present (either inject `cache.redis` automatically or embed redis requirement into bullmq module)
* Add env keys:

  * `QUEUE_NAME=default`
  * `REDIS_URL=redis://redis:6379`
* docker-compose: ensure `redis` exists
* add a health subcheck if you want later (optional)

---

## Where this touches your current generator (`generator.ts`)

Right now `generateApp()` does:

* scaffold → platform → domains → auth → docs → scripts

**Phase 2 change:**

* Add a step after platform generation:

```ts
// 1.75 Inject modules (optional)
await applyModuleInjections(spec.modules ?? [], outDir, templatesDir, dryRun);
```

This can be a separate file `modules/injector.ts` that applies patch ops.

---

# 3) MCP server skeleton (stdio) + tools/resources/prompts

We’ll follow official guidance for building MCP servers and TS SDK usage. ([Model Context Protocol][1])

## Package split (recommended)

* `archon-core` (your existing generator/validator/spec)
* `archon-mcp-server` (new wrapper)

Why: MCP server stays thin and stable; generator keeps evolving.

---

## MCP: what you expose

### Resources

* `archon://schema/designspec-v1` → returns the JSON schema above
* `archon://modules/catalog` → list modules + required env + what they wire
* `archon://examples/specs/basic` → a known-good spec

Resources are designed for “data/context the client decides to use.” ([MCP Protocol][2])

### Prompts

* `archon.architect_mode_v1` → elicitation checklist + spec output rules
* `archon.inject_module_v1` → targeted questions per module

### Tools (MVP set)

1. `archon.validate_designspec`
2. `archon.generate_project`
3. `archon.inject_module`
4. `archon.docker_smoke`
5. `archon.list_modules`
6. `archon.get_module_schema`

---

## MCP server skeleton code (TypeScript, stdio)

This is the minimal “server boots + tools work” shape consistent with TS SDK patterns. ([Model Context Protocol][1])

```ts
// archon-mcp-server/src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { validateSpecSchema, validateSpecSemantic } from "@archon/core/validator";
import { generateApp } from "@archon/core/generator";

// You can load the schema JSON from disk; for MVP keep it inline or bundled.
import designSpecV1Schema from "./resources/designspec.v1.schema.json" assert { type: "json" };

const server = new McpServer({
  name: "archon",
  version: "2.0.0"
});

/**
 * -------------------------
 * Resources
 * -------------------------
 */
server.resource(
  "designspec-schema-v1",
  "archon://schema/designspec-v1",
  async () => ({
    contents: [
      {
        uri: "archon://schema/designspec-v1",
        text: JSON.stringify(designSpecV1Schema, null, 2)
      }
    ]
  })
);

server.resource(
  "modules-catalog",
  "archon://modules/catalog",
  async () => ({
    contents: [
      {
        uri: "archon://modules/catalog",
        text: JSON.stringify(
          {
            modules: [
              {
                type: "cache.redis",
                requiredEnv: ["REDIS_URL"],
                adds: ["RedisModule", "docker-compose redis service"]
              },
              {
                type: "queue.bullmq",
                requiredEnv: ["QUEUE_NAME", "REDIS_URL"],
                adds: ["QueueModule", "worker", "docker-compose redis service"]
              }
            ]
          },
          null,
          2
        )
      }
    ]
  })
);

/**
 * -------------------------
 * Tools
 * -------------------------
 */

// 1) validate
server.tool(
  "archon.validate_designspec",
  {
    description: "Validate DesignSpec v1 schema + semantic rules. Returns errors/warnings.",
    inputSchema: z.object({
      spec: z.any()
    })
  },
  async ({ spec }) => {
    const schemaErrors = validateSpecSchema(spec);
    // semantic expects DesignSpec shape; for v1 you'll call normalizeToOldShape or update semantic validator.
    const semanticErrors = schemaErrors.length ? [] : validateSpecSemantic(spec);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ok: schemaErrors.length === 0 && semanticErrors.length === 0,
              schemaErrors,
              semanticErrors
            },
            null,
            2
          )
        }
      ]
    };
  }
);

// 2) generate project
server.tool(
  "archon.generate_project",
  {
    description: "Generate a NestJS backend into outDir from the given spec.",
    inputSchema: z.object({
      spec: z.any(),
      outDir: z.string().min(1),
      dryRun: z.boolean().optional().default(false)
    })
  },
  async ({ spec, outDir, dryRun }) => {
    const schemaErrors = validateSpecSchema(spec);
    if (schemaErrors.length) {
      return {
        content: [
          { type: "text", text: JSON.stringify({ ok: false, schemaErrors }, null, 2) }
        ]
      };
    }

    await generateApp(spec, outDir, dryRun);

    return {
      content: [
        { type: "text", text: JSON.stringify({ ok: true, outDir }, null, 2) }
      ]
    };
  }
);

// 3) docker smoke (MVP: call a fixed script inside the generated project)
server.tool(
  "archon.docker_smoke",
  {
    description: "Run docker compose build/up and curl readiness endpoint.",
    inputSchema: z.object({
      outDir: z.string().min(1)
    })
  },
  async ({ outDir }) => {
    // For MVP, call your generated scripts/qa-docker.sh with a safe spawn wrapper.
    // In Phase 2.1 keep it opt-in.
    return {
      content: [
        {
          type: "text",
          text:
            "Not implemented in skeleton. Next: spawn scripts/qa-docker.sh with workspace restrictions."
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // keep stderr for host debugging
  console.error(err);
  process.exit(1);
});
```

Notes:

* This uses the TS SDK + stdio transport pattern seen in official build-server docs. ([Model Context Protocol][1])
* For `docker_smoke`, you’ll implement a safe `spawn` with a workspace root allowlist (Phase 2.1).

---

## Claude integration (what makes it “unique value”)

Once connected, Claude can:

* fetch schema resource
* use the architect prompt
* call tools to validate/generate/smoke

That’s exactly MCP’s goal: “connect AI hosts like Claude to tools/resources/prompts through a standard interface.” ([Model Context Protocol][3])

---

# Immediate implementation checklist (ordered, no ambiguity)

## Step A — Spec v1

1. Add `designspec.v1.schema.json`
2. Update `validator.ts` to validate v1 (swap schema, keep semantic checks adapted)
3. Add `normalizeToV1()` and defaults:

   * project.apiPrefix default `"api/v1"`
   * platform.maxBodySize default `"1mb"`
   * platform.docker/swagger default `true`

## Step B — Module injection (redis + bullmq)

4. Create `src/modules/injections/` folder with:

   * `cache.redis/` templates + `wiring.ts`
   * `queue.bullmq/` templates + `wiring.ts`
5. Add `applyModuleInjections()` call into generation pipeline (after platform)

## Step C — MCP server (stdio)

6. Create `archon-mcp-server` package
7. Implement:

   * `resource` endpoints (schema, modules catalog, examples)
   * tools: validate + generate (first)
8. Implement `docker_smoke` tool with a safe spawn wrapper

---

If you want, next message I can deliver **the exact `validator.ts` refactor** (v1 schema + semantic validation updated for `project.name` vs `name`), and the **module injection patch DSL** implementation file so we can start coding Phase 2 immediately.

[1]: https://modelcontextprotocol.io/docs/develop/build-server?utm_source=chatgpt.com "Build an MCP server"
[2]: https://modelcontextprotocol.info/docs/concepts/resources/?utm_source=chatgpt.com "Resources"
[3]: https://modelcontextprotocol.io/?utm_source=chatgpt.com "Model Context Protocol"
