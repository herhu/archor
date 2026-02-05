Got it. Let’s do this in two parts:

1. **Analyze current project status** (what you already have, what’s proven, what’s missing)
2. **Create the Phase 2 plan** to add MCP (stdio) + Claude workflow exactly as discussed

Also: some older uploads have expired on my side (normal tool limitation). The good news is your **current status snapshot** in `herhu-archor-8a5edab282632443.txt` is enough to plan Phase 2 confidently.

---

# 1) Current status of your project (ground truth)

## Repo layout (what exists)

You currently have:

### A) `archon/` — the CLI + generator core

* Commands:

  * `src/commands/init.ts`
  * `src/commands/generate.ts`
* Core engine:

  * `core/spec.ts`, `validator.ts` (AJV), `normalize.ts`, `generator.ts`, `io.ts`
* Templates:

  * `templates/platform/*` (your “platform baseline”: config, logging/pino, filters, health, interceptors, middleware, swagger)
  * `templates/nestjs/*` (domain/controller/dto/entity/service templates + auth templates)
  * `templates/scripts/*` (curl helpers + token helpers)

This means you already have the **deterministic compiler** foundation.

### B) `archon-out/` — generated output (proves real execution)

Your generated app already includes:

* Docker pack: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.docker`
* QA + smoke scripts: `qa-docker.sh`, `smoke.sh`, `docker-up/down.sh`, `curl.sh`, `get-token.sh`
* Platform code in `src/shared/*`
* Domain module example: `modules/patient/...`
* E2E test: `test/health.e2e-spec.ts`

So Phase 1 “platform template + Docker + endpoint tested” is implemented and demonstrably runnable.

### C) Landing + Prompt docs

* `Landing/index.html`
* Prompt iterations in `Prompt/`, `Prompt v2/`, `Prompt v3/`

Good—this becomes your Prompt assets for MCP “Prompts”.

---

## What’s strong already (✅)

* Deterministic generation (Handlebars templates + normalize/validate)
* Platform baseline is solid (logging, correlation-id, error filter, health/ready, swagger, throttling, DB wiring)
* Docker “one command” experience exists + smoke tests exist
* A sample domain module exists

---

## What’s missing for Phase 2 (the exact gaps)

Right now everything runs as a **CLI**. Phase 2 needs:

1. A **formal DesignSpec v1** (versioned JSON schema as product contract)
2. “Incremental actions” (add entity/module into existing repo) — not just generate once
3. An MCP server layer that exposes:

   * **Resources** (schemas, examples, templates list)
   * **Prompts** (your Architect Mode + elicitation flows)
   * **Tools** (validate spec, generate project, inject module, docker smoke)
4. A safe “tool sandbox” policy (write only within workspace; no arbitrary shell)

These are all straight lines from what you already built.

---

# 2) Phase 2 plan: MCP + Claude on top of Archon

We’ll follow the MCP model: servers expose **Resources / Prompts / Tools**. ([Model Context Protocol][1])
We’ll build with the official TS SDK. ([GitHub][2])
We’ll use **stdio** first (Claude Desktop / local). MCP supports local server connections and provides build-server guidance. ([Model Context Protocol][3])

## Phase 2 milestone structure (practical)

### Milestone 2.0 — “Spec Contract”

**Goal:** lock DesignSpec v1 as a product interface

Deliverables:

* `designspec.schema.json` (JSON Schema)
* `spec.ts` updated to include:

  * `version`
  * `platform` toggles
  * `modules[]` injection list
* `validator.ts` validates DesignSpec v1 with good errors (AJV already there)

Why first: everything else depends on a stable contract.

---

### Milestone 2.1 — “MCP Server skeleton (stdio)”

**Goal:** Claude can connect, discover capabilities

Create a new package (recommended):

* `archon-mcp/` (new)

  * depends on `@modelcontextprotocol/typescript-sdk` ([GitHub][2])
  * connects via **stdio transport** (Phase 2 default)
  * exposes:

    * `listResources` / `readResource` (Resources) ([Model Context Protocol][1])
    * `listPrompts` / `getPrompt` (Prompts) ([Model Context Protocol][4])
    * `listTools` / `callTool` (Tools)

Tools initially (minimum):

1. `archon.validate_spec`
2. `archon.generate_project`
3. `archon.docker_smoke`
4. `archon.list_modules`

---

### Milestone 2.2 — “Resources & Prompts”

**Resources** to expose:

* `archon://schema/designspec-v1`
* `archon://examples/specs/*`
* `archon://modules/catalog`
* `archon://templates/platform-capabilities`

Resources are explicitly meant to provide contextual data to models. ([Model Context Protocol][1])

**Prompts** to expose (start with 2):

* `archon.architect_mode_v1` (elicitation → spec)
* `archon.inject_module_v1` (ask the right questions to inject redis/queue)

Prompts are first-class in MCP for reusable structured instructions. ([Model Context Protocol][4])

---

### Milestone 2.3 — “Module injection engine”

**Goal:** add capability without regenerating everything

Add two module types (prove the pattern):

* `cache.redis`
* `queue.bullmq`

Each module gets:

* its own schema fragment
* templates
* wiring rules:

  * update `app.module.ts` imports/providers
  * update config schema + `.env.example` + `.env.docker`
  * update docker-compose (add redis service if needed)
  * add docs/snippets

This is the “game changer” piece you described.

---

### Milestone 2.4 — “Incremental CRUD (add entity)”

New tool:

* `archon.add_entity(outDir, entitySpec)`

This is your Option 1 strategy: start with platform, then grow. It’s also the easiest to sell.

---

## Safety + trust model (important)

MCP strongly emphasizes client validation and human-in-the-loop safety. ([Model Context Protocol][5])

So for your tools:

* Only allow writing under a provided `workspaceRoot`
* No “run arbitrary command” tool in v1
* docker smoke can be opt-in (explicit tool call)
* validate inputs (schema) and return structured errors

---

# Next step: I need ONE artifact from you

To analyze “current status” more deeply than the folder tree, paste the content of:

* `archon/src/core/spec.ts`
* `archon/src/core/validator.ts`
* (optional) `archon/src/core/generator.ts`

With those 2–3 files, I can:

* extract the exact current spec shape
* propose the minimal DesignSpec v1 changes
* map tool functions for the MCP server (library-call, not subprocess)

If you paste them, I’ll respond with:

* DesignSpec v1 draft (JSON)
* module injection contract skeleton
* MCP tool list + input/output schemas
* implementation task list ordered for fastest progress

[1]: https://modelcontextprotocol.io/specification/2025-06-18/server/resources?utm_source=chatgpt.com "Resources"
[2]: https://github.com/modelcontextprotocol/typescript-sdk?utm_source=chatgpt.com "modelcontextprotocol/typescript-sdk"
[3]: https://modelcontextprotocol.io/docs/develop/build-server?utm_source=chatgpt.com "Build an MCP server"
[4]: https://modelcontextprotocol.io/specification/2025-06-18/server/prompts?utm_source=chatgpt.com "Prompts"
[5]: https://modelcontextprotocol.io/llms-full.txt?utm_source=chatgpt.com "llms - full.txt"
