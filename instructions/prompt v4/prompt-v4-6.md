Let’s implement **1) DesignSpec v1 schema**, **2) module injection contract**, **3) MCP server skeleton** — directly on top of your current `spec.ts / validator.ts / generator.ts` (no rewrites, just additive evolution).

You already have:

* legacy spec (`DesignSpec`) in `spec.ts`
* AJV validation in `validator.ts`
* deterministic generator in `generator.ts`

So we’ll do this:

✅ Add **DesignSpecV1** *alongside* the legacy spec
✅ Update validator to accept **both** (legacy + v1)
✅ Update generator to accept **both** by normalizing v1 → legacy
✅ Add module injection scaffolding (redis + bullmq)
✅ Add MCP server wrapper (stdio), calling your generator as a library

---

# 1) DesignSpec v1 (schema + TS types)

## 1.1 Update `spec.ts` (add v1 types, keep legacy)

Add this **below** your current interfaces (do not delete legacy):

```ts
// ---- Phase 2: DesignSpec v1 (versioned) ----

export interface DesignSpecV1 {
  version: "1.0";
  project: {
    name: string;
    apiPrefix?: string; // default "api/v1"
    port?: number; // default 3000
  };
  platform?: {
    docker?: boolean; // default true
    swagger?: boolean; // default true
    maxBodySize?: string; // default "1mb"
    throttling?: { ttl: number; limit: number };
    cors?: { origins?: string[]; allowDevAll?: boolean };
  };
  crossCutting?: DesignSpec["crossCutting"]; // reuse legacy shape
  domains: Domain[]; // reuse legacy Domain
  modules?: ModuleInjection[];
  assumptions?: string[];
}

export type ModuleInjection =
  | { type: "cache.redis"; config: { redisUrlEnv?: string } }
  | {
      type: "queue.bullmq";
      config: { queueName: string; redisUrlEnv?: string };
    };
```

This preserves everything you already built.

---

## 1.2 Add a new schema file: `designspec.v1.schema.json`

Create `archon/src/core/schemas/designspec.v1.schema.json`:

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
      "additionalProperties": true
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
        "entities": { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/entity" } },
        "services": { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/service" } }
      }
    },

    "entity": {
      "type": "object",
      "required": ["name", "fields"],
      "additionalProperties": false,
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "primaryKey": { "type": "string" },
        "fields": { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/field" } }
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
        "crud": { "type": "array", "items": { "enum": ["create", "findAll", "findOne", "update", "delete"] } },
        "operations": { "type": "array", "items": { "$ref": "#/$defs/operation" } }
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
            "scopesAll": { "type": "array", "items": { "type": "string", "pattern": "^[a-z0-9-]+:[a-z]+$" } }
          }
        }
      }
    },

    "moduleInjection": {
      "type": "object",
      "required": ["type", "config"],
      "additionalProperties": false,
      "properties": {
        "type": { "type": "string", "enum": ["cache.redis", "queue.bullmq"] },
        "config": { "type": "object" }
      },
      "allOf": [
        {
          "if": { "properties": { "type": { "const": "cache.redis" } } },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                  "redisUrlEnv": { "type": "string", "default": "REDIS_URL" }
                }
              }
            }
          }
        },
        {
          "if": { "properties": { "type": { "const": "queue.bullmq" } } },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "required": ["queueName"],
                "additionalProperties": false,
                "properties": {
                  "queueName": { "type": "string", "minLength": 1 },
                  "redisUrlEnv": { "type": "string", "default": "REDIS_URL" }
                }
              }
            }
          }
        }
      ]
    }
  }
}
```

---

## 1.3 Update `validator.ts` to support legacy + v1

Replace your current `validateSpecSchema()` with a dual-mode validator + add a normalizer:

```ts
import Ajv from "ajv";
import { DesignSpec, DesignSpecV1 } from "./spec";
import * as path from "path";
import * as fs from "fs-extra";

const ajv = new Ajv({ allErrors: true });

const legacySchema = /* keep your current specSchema object here */;

// Load v1 schema JSON once
const v1SchemaPath = path.join(__dirname, "schemas", "designspec.v1.schema.json");
const v1Schema = fs.readJsonSync(v1SchemaPath);

const validateLegacy = ajv.compile(legacySchema);
const validateV1 = ajv.compile(v1Schema);

export function isV1(spec: any): spec is DesignSpecV1 {
  return !!spec && typeof spec === "object" && spec.version === "1.0" && !!spec.project;
}

export function normalizeToLegacy(spec: DesignSpec | DesignSpecV1): DesignSpec {
  if (!isV1(spec)) return spec;

  return {
    name: spec.project.name,
    domains: spec.domains,
    crossCutting: spec.crossCutting
  };
}

export function validateSpecSchema(spec: any): string[] {
  const validate = isV1(spec) ? validateV1 : validateLegacy;
  const ok = validate(spec);
  if (ok) return [];
  return validate.errors?.map(e => `${e.instancePath} ${e.message}`) || ["Unknown schema error"];
}

export function validateSpecSemantic(specAny: any): string[] {
  // semantic rules still work on legacy structure
  const spec = normalizeToLegacy(specAny as any);
  const errors: string[] = [];
  const domainKeys = new Set<string>();

  spec.domains.forEach(d => {
    if (domainKeys.has(d.key)) errors.push(`Duplicate domain key: ${d.key}`);
    domainKeys.add(d.key);

    d.services.forEach(s => {
      if (d.entities.length > 1 && !s.entity) {
        errors.push(
          `Service ${s.name} inside domain ${d.name} is ambiguous. Domain has multiple entities, so service.entity must be specified.`
        );
      }
      if (s.entity) {
        const entityExists = d.entities.find(e => e.name === s.entity);
        if (!entityExists) errors.push(`Service ${s.name} references missing entity: ${s.entity}`);
      }

      s.operations?.forEach(op => {
        op.authz?.scopesAll?.forEach(scope => {
          if (!scope.startsWith(`${d.key}:`)) {
            errors.push(`Invalid scope "${scope}" in operation "${op.name}". must start with domain key "${d.key}:"`);
          }
        });
      });
    });
  });

  return errors;
}
```

✅ You now validate both specs
✅ Generator can remain legacy-based internally
✅ MCP server can speak DesignSpec v1 only

---

# 2) Module injection contract (redis + bullmq) + wiring hook

## 2.1 Add injection step into generator pipeline

In your `generateApp(...)` (top-level), before domains are generated, add:

```ts
import { applyModuleInjections } from "./modules/injector";
import { normalizeToLegacy } from "./validator";
```

Then:

```ts
export async function generateApp(specAny: any, outDir: string, dryRun = false) {
  const spec = normalizeToLegacy(specAny);

  // existing scaffold/platform generation...
  await generateScaffold(spec, outDir, tplDir, dryRun);
  await generatePlatform(spec, outDir, tplDir, dryRun);

  // NEW: apply injections (v1 only, legacy can ignore)
  await applyModuleInjections(specAny, outDir, tplDir, dryRun);

  // then continue:
  for (const domain of spec.domains) await generateDomain(domain, outDir, tplDir, dryRun);
  ...
}
```

The injector receives the **original specAny** so it can read `modules[]` if present.

---

## 2.2 Create `src/core/modules/injector.ts`

Minimal deterministic injector (no AI edits, only known patches):

```ts
import * as path from "path";
import * as fs from "fs-extra";
import { writeArtifact } from "../io";
import { isV1 } from "../validator";
import { DesignSpecV1, ModuleInjection } from "../spec";

export async function applyModuleInjections(
  specAny: any,
  outDir: string,
  tplDir: string,
  dryRun: boolean
) {
  if (!isV1(specAny)) return;

  const spec = specAny as DesignSpecV1;
  const modules = spec.modules ?? [];
  for (const m of modules) {
    switch (m.type) {
      case "cache.redis":
        await injectRedis(m, outDir, tplDir, dryRun);
        break;
      case "queue.bullmq":
        await injectBullmq(m, outDir, tplDir, dryRun);
        break;
    }
  }
}

async function injectRedis(
  m: Extract<ModuleInjection, { type: "cache.redis" }>,
  outDir: string,
  tplDir: string,
  dryRun: boolean
) {
  // 1) write shared redis module files from templates
  const base = path.join(tplDir, "modules/cache.redis");
  const target = path.join(outDir, "src/shared/redis");

  const redisModuleTpl = await fs.readFile(path.join(base, "redis.module.ts.hbs"), "utf-8");
  const redisServiceTpl = await fs.readFile(path.join(base, "redis.service.ts.hbs"), "utf-8");

  await writeArtifact(path.join(target, "redis.module.ts"), redisModuleTpl, dryRun);
  await writeArtifact(path.join(target, "redis.service.ts"), redisServiceTpl, dryRun);

  // 2) env keys (append)
  await appendEnv(outDir, ".env.example", "REDIS_URL=redis://redis:6379");
  await appendEnv(outDir, ".env.docker", "REDIS_URL=redis://redis:6379");

  // 3) docker-compose (append redis service if not present)
  await ensureRedisService(outDir, dryRun);

  // 4) app.module.ts wiring (simple string insertion)
  await wireImport(outDir, "RedisModule", "./shared/redis/redis.module", dryRun);
  await wireAppImports(outDir, "RedisModule", dryRun);
}

async function injectBullmq(
  m: Extract<ModuleInjection, { type: "queue.bullmq" }>,
  outDir: string,
  tplDir: string,
  dryRun: boolean
) {
  // bullmq requires redis: ensure redis is present
  await injectRedis({ type: "cache.redis", config: { redisUrlEnv: "REDIS_URL" } }, outDir, tplDir, dryRun);

  const base = path.join(tplDir, "modules/queue.bullmq");
  const target = path.join(outDir, "src/shared/queue");

  const queueModuleTpl = await fs.readFile(path.join(base, "queue.module.ts.hbs"), "utf-8");
  const queueServiceTpl = await fs.readFile(path.join(base, "queue.service.ts.hbs"), "utf-8");

  await writeArtifact(path.join(target, "queue.module.ts"), queueModuleTpl, dryRun);
  await writeArtifact(path.join(target, "queue.service.ts"), queueServiceTpl, dryRun);

  // worker example
  const workerTpl = await fs.readFile(path.join(base, "worker.ts.hbs"), "utf-8");
  await writeArtifact(path.join(outDir, "src/workers", `${m.config.queueName}.worker.ts`), workerTpl, dryRun);

  await appendEnv(outDir, ".env.example", `QUEUE_NAME=${m.config.queueName}`);
  await appendEnv(outDir, ".env.docker", `QUEUE_NAME=${m.config.queueName}`);

  await wireImport(outDir, "QueueModule", "./shared/queue/queue.module", dryRun);
  await wireAppImports(outDir, "QueueModule", dryRun);
}

// ---- helpers ----

async function appendEnv(outDir: string, file: string, line: string) {
  const p = path.join(outDir, file);
  const exists = await fs.pathExists(p);
  if (!exists) return;
  const content = await fs.readFile(p, "utf-8");
  if (content.includes(line)) return;
  await fs.writeFile(p, content.trimEnd() + "\n" + line + "\n");
}

async function ensureRedisService(outDir: string, dryRun: boolean) {
  const composePath = path.join(outDir, "docker-compose.yml");
  if (!(await fs.pathExists(composePath))) return;
  const yml = await fs.readFile(composePath, "utf-8");
  if (yml.includes("\n  redis:\n")) return;

  const redisBlock = `
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 20
`;

  // naive: insert under services:
  const updated = yml.replace(/services:\n/, `services:\n${redisBlock}`);
  if (!dryRun) await fs.writeFile(composePath, updated);
}

async function wireImport(outDir: string, symbol: string, from: string, dryRun: boolean) {
  const appModule = path.join(outDir, "src/app.module.ts");
  if (!(await fs.pathExists(appModule))) return;

  let content = await fs.readFile(appModule, "utf-8");
  const importLine = `import { ${symbol} } from "${from}";`;
  if (content.includes(importLine)) return;

  // insert after last import
  content = content.replace(/(import .*;\n)(?![\s\S]*import .*;\n)/, `$1${importLine}\n`);
  if (!dryRun) await fs.writeFile(appModule, content);
}

async function wireAppImports(outDir: string, symbol: string, dryRun: boolean) {
  const appModule = path.join(outDir, "src/app.module.ts");
  if (!(await fs.pathExists(appModule))) return;

  let content = await fs.readFile(appModule, "utf-8");
  if (content.includes(`${symbol},`)) return;

  // insert into @Module({ imports: [ ... ] })
  content = content.replace(/imports:\s*\[\s*/m, (m) => m + `\n    ${symbol},\n`);
  if (!dryRun) await fs.writeFile(appModule, content);
}
```

This is intentionally **deterministic** and “compiler-like”. We can later replace naïve string patching with AST transforms, but this is enough to prove the pattern.

---

## 2.3 Add module templates

Create these template folders:

* `templates/modules/cache.redis/redis.module.ts.hbs`
* `templates/modules/cache.redis/redis.service.ts.hbs`
* `templates/modules/queue.bullmq/queue.module.ts.hbs`
* `templates/modules/queue.bullmq/queue.service.ts.hbs`
* `templates/modules/queue.bullmq/worker.ts.hbs`

(If you say “generate template contents now”, I’ll paste the full code for each file.)

---

# 3) MCP server skeleton (stdio, TS SDK) wired to your generator

## 3.1 Create new package `archon-mcp-server`

Structure:

```
archon-mcp-server/
  src/
    index.ts
    resources/
      designspec.v1.schema.json  (copy from core)
      modules.catalog.json
  package.json
  tsconfig.json
```

## 3.2 `archon-mcp-server/src/index.ts`

This is the working skeleton: resources + tools.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

import { validateSpecSchema, validateSpecSemantic } from "../archon/src/core/validator"; // adjust path in monorepo
import { generateApp } from "../archon/src/core/generator";

const server = new McpServer({ name: "archon", version: "2.0.0" });

// ---- Resources ----
const schemaPath = path.join(__dirname, "resources", "designspec.v1.schema.json");
server.resource("designspec-v1", "archon://schema/designspec-v1", async () => ({
  contents: [
    { uri: "archon://schema/designspec-v1", text: fs.readFileSync(schemaPath, "utf-8") }
  ]
}));

const catalogPath = path.join(__dirname, "resources", "modules.catalog.json");
server.resource("modules-catalog", "archon://modules/catalog", async () => ({
  contents: [
    { uri: "archon://modules/catalog", text: fs.readFileSync(catalogPath, "utf-8") }
  ]
}));

// ---- Tools ----

server.tool(
  "archon.validate_designspec",
  {
    description: "Validate DesignSpec (v1 preferred). Returns schema + semantic errors.",
    inputSchema: z.object({ spec: z.any() })
  },
  async ({ spec }) => {
    const schemaErrors = validateSpecSchema(spec);
    const semanticErrors = schemaErrors.length ? [] : validateSpecSemantic(spec);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { ok: schemaErrors.length === 0 && semanticErrors.length === 0, schemaErrors, semanticErrors },
            null,
            2
          )
        }
      ]
    };
  }
);

server.tool(
  "archon.generate_project",
  {
    description: "Generate a backend project into outDir using Archon generator.",
    inputSchema: z.object({
      spec: z.any(),
      outDir: z.string().min(1),
      dryRun: z.boolean().optional().default(false)
    })
  },
  async ({ spec, outDir, dryRun }) => {
    const schemaErrors = validateSpecSchema(spec);
    if (schemaErrors.length) {
      return { content: [{ type: "text", text: JSON.stringify({ ok: false, schemaErrors }, null, 2) }] };
    }
    await generateApp(spec as any, outDir, path.resolve(__dirname, "../archon/templates"), dryRun);
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, outDir }, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Notes:

* Keep it **library-call** (best choice). No subprocess needed yet.
* `generateApp` signature in your generator currently expects `(spec, outDir, tplDir, dryRun)` — we pass the templates path.
* We’ll add `docker_smoke` tool next (safe spawn wrapper + workspace restriction).

---

## 3.3 `modules.catalog.json`

Example:

```json
{
  "modules": [
    {
      "type": "cache.redis",
      "requiredEnv": ["REDIS_URL"],
      "adds": ["RedisModule", "redis docker-compose service"]
    },
    {
      "type": "queue.bullmq",
      "requiredEnv": ["QUEUE_NAME", "REDIS_URL"],
      "adds": ["QueueModule", "worker", "redis docker-compose service"]
    }
  ]
}
```

---

# Fast sanity checks (do these immediately)

## CLI compatibility

Your CLI can keep passing the legacy spec (`{ name, domains, crossCutting }`), and generation still works.

## Phase 2 compatibility

Claude/MCP uses **only v1**:

* `version: "1.0"`
* `project.name`
* `domains` (same as before)
* optional `modules[]`

Generator still works because:

* validator normalizes v1 → legacy internally
* generator uses legacy fields (`spec.name`, `spec.domains`)

---

# Next thing I can deliver immediately

Say **“paste module templates”** and I’ll output:

* redis module/service templates
* bullmq module/service/worker templates
* plus the exact `package.json` deps you need (ioredis + bullmq) and the injection code to merge them into generated `package.json`.

That’s the “module injection becomes real” moment.
