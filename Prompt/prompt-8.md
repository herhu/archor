Below are the **Docs + Diagrams v1 templates** and a **cross-platform build/QA command** you can drop straight into the generator. This completes the “consultant-grade deliverable” bundle for Phase 1.

---

# A) Docs renderer templates (Markdown)

## 1) `docs/architecture.md.hbs`

**Path:** `src/core/generators/docs/markdown/templates/architecture.md.hbs`

````hbs
# {{projectName}} — Architecture

## Overview
{{projectDescription}}

**Primary use case:** {{primaryUseCase}}

## Stack
- Language: TypeScript
- Runtime: {{runtime}}
- Framework: NestJS
- ORM: {{orm}}
- Database: Postgres
- API: REST

## Constraints
- Stage: {{scaleStage}}
- Expected users: {{expectedUsers}}
- Peak RPS: {{rpsPeak}}
- Security level: {{securityLevel}}
- Compliance: {{#each compliance}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## Components
```mermaid
{{componentsMermaid}}
````

## Domains & Modules

{{#each domains}}

### {{label}} ({{key}})

* Base route: `{{baseRoute}}`
* Module: `src/modules/{{key}}/{{key}}.module.ts`

**Entities**
{{#if entities.length}}
{{#each entities}}

* `{{name}}` → table `{{table}}`
  {{/each}}
  {{else}}
* (none)
  {{/if}}

**Services**
{{#each services}}

* `{{label}}` → route `{{route}}`
  {{/each}}

{{/each}}

## Auth & Authorization

* Mode: {{authMode}}
* RBAC: {{#if rbacEnabled}}enabled{{else}}disabled{{/if}}
  {{#if rbacEnabled}}
* Roles: {{#each roles}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
  {{/if}}

## Error Strategy

* Strategy: {{errorStrategy}}
* Common errors:
  {{#each errorMap}}
* `{{code}}` → HTTP {{httpStatus}} — {{message}}
  {{/each}}

## Observability

* Logging: {{logging}}
* Metrics: {{metrics}}
* Tracing: {{tracing}}

## Environment Variables

{{#each envVars}}

* `{{key}}` {{#if required}}(required){{else}}(optional){{/if}} — {{description}}{{#if example}} (e.g. `{{example}}`){{/if}}
  {{/each}}

## Notes

This repository was generated from a validated **DesignSpec v1** contract (`designspec.json`).

````

---

## 2) `docs/api.md.hbs`

**Path:** `src/core/generators/docs/markdown/templates/api.md.hbs`

```hbs
# API Reference — {{projectName}}

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
{{#each endpoints}}
| {{method}} | `{{path}}` | {{#if authRequired}}Yes{{else}}No{{/if}} {{#if rolesAny.length}}(roles: {{#each rolesAny}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}){{/if}} | {{description}} |
{{/each}}

## Conventions
- CRUD endpoints follow: POST/GET/GET(id)/PATCH/DELETE
- Errors follow the project error strategy (`crossCutting.errors`)
````

---

## 3) `docs/decisions.md.hbs`

**Path:** `src/core/generators/docs/markdown/templates/decisions.md.hbs`

```hbs
# Decisions — {{projectName}}

{{#each decisions}}
- **{{title}}**: {{reason}}
{{/each}}

## Auto-decisions (v1)
- Postgres selected for relational consistency and ecosystem maturity.
- REST selected for broad client compatibility.
- Deterministic templates used for code generation to avoid LLM hallucinations.
```

---

# B) Mermaid diagram templates

## 4) `diagrams/components.mmd.hbs`

**Path:** `src/core/generators/diagrams/mermaid/templates/components.mmd.hbs`

```hbs
flowchart LR
  User([Client / User]) --> API[NestJS API]

  API --> DB[(Postgres)]

  {{#if authEnabled}}
  User --> Auth[JWT Auth]
  Auth --> API
  {{/if}}

  subgraph Domains[Domains]
  {{#each domains}}
    {{className}}[{{label}}] --> API
  {{/each}}
  end
```

> This is intentionally simple in v1. It renders cleanly everywhere.

---

## 5) `diagrams/domain.mmd.hbs`

**Path:** `src/core/generators/diagrams/mermaid/templates/domain.mmd.hbs`

```hbs
classDiagram
  direction LR

  {{#each entities}}
  class {{name}} {
    {{#each fields}}
    {{name}}: {{tsType}}
    {{/each}}
  }
  {{/each}}

  {{!-- relations are optional in v1; add later if needed --}}
```

---

## 6) `diagrams/sequence.operation.mmd.hbs` (optional v1)

**Path:** `src/core/generators/diagrams/mermaid/templates/sequence.operation.mmd.hbs`

```hbs
sequenceDiagram
  participant C as Client
  participant API as NestJS API
  participant S as Service
  participant DB as Postgres

  C->>API: {{method}} {{path}}
  API->>S: {{operationName}}(...)
  S->>DB: read/write
  DB-->>S: result
  S-->>API: result
  API-->>C: 200 OK
```

---

# C) Docs + Diagrams generator code

## 7) Docs generator

**Path:** `src/core/generators/docs/markdown/index.ts`

```ts
import path from "path";
import { renderToFile } from "../../../render/render";
import type { GenerationModel } from "../../../planner/types";

function tpl(name: string) {
  return path.join(process.cwd(), "src/core/generators/docs/markdown/templates", name);
}

export function generateDocs(model: GenerationModel, spec: any) {
  const constraints = spec.constraints ?? {};
  const scale = constraints.scale ?? {};
  const obs = spec.crossCutting?.observability ?? {};

  const endpoints = buildEndpoints(spec);

  const decisions = buildDecisions(spec);

  renderToFile(
    tpl("architecture.md.hbs"),
    {
      projectName: model.projectName,
      projectDescription: spec.project?.description ?? "",
      primaryUseCase: spec.project?.primaryUseCase ?? "",
      runtime: spec.stack?.runtime ?? "node20",
      orm: spec.stack?.orm ?? "typeorm",
      scaleStage: scale.stage ?? "mvp",
      expectedUsers: scale.expectedUsers ?? 1000,
      rpsPeak: scale.rpsPeak ?? 10,
      securityLevel: constraints.securityLevel ?? "standard",
      compliance: constraints.compliance ?? ["none"],
      domains: model.domains.map(d => ({
        key: d.key,
        label: spec.domains.find((x: any) => x.key === d.key)?.label ?? d.className,
        className: d.className,
        baseRoute: d.baseRoute,
        entities: d.entities.map(e => ({ name: e.name, table: e.table })),
        services: d.services.map(s => ({
          key: s.key,
          label: spec.domains
            .find((x: any) => x.key === d.key)
            ?.services?.find((ss: any) => ss.key === s.key)?.label ?? s.className,
          route: s.route
        }))
      })),
      authMode: model.authMode,
      authEnabled: model.authMode === "jwt",
      rbacEnabled: model.rbacEnabled,
      roles: model.roles,
      errorStrategy: spec.crossCutting?.errors?.strategy ?? "simple-json",
      errorMap: model.errorMap,
      logging: obs.logging ?? "console-json",
      metrics: obs.metrics ?? "none",
      tracing: obs.tracing ?? "none",
      envVars: model.envVars,
      componentsMermaid: "(see diagrams/components.mmd)"
    },
    path.join(model.outDir, "docs", "architecture.md")
  );

  renderToFile(
    tpl("api.md.hbs"),
    {
      projectName: model.projectName,
      endpoints
    },
    path.join(model.outDir, "docs", "api.md")
  );

  renderToFile(
    tpl("decisions.md.hbs"),
    {
      projectName: model.projectName,
      decisions
    },
    path.join(model.outDir, "docs", "decisions.md")
  );
}

function buildEndpoints(spec: any) {
  const eps: any[] = [];
  for (const d of spec.domains ?? []) {
    for (const s of d.services ?? []) {
      const route = s.route;

      const crud = new Set(s.crud ?? []);
      if (crud.has("create")) eps.push({ method: "POST", path: route, authRequired: true, rolesAny: [], description: "Create resource" });
      if (crud.has("findAll")) eps.push({ method: "GET", path: route, authRequired: true, rolesAny: [], description: "List resources" });
      if (crud.has("findOne")) eps.push({ method: "GET", path: `${route}/:id`, authRequired: true, rolesAny: [], description: "Get resource by id" });
      if (crud.has("update")) eps.push({ method: "PATCH", path: `${route}/:id`, authRequired: true, rolesAny: [], description: "Update resource" });
      if (crud.has("delete")) eps.push({ method: "DELETE", path: `${route}/:id`, authRequired: true, rolesAny: [], description: "Delete resource" });

      for (const op of s.operations ?? []) {
        eps.push({
          method: op.method,
          path: `${route}${op.path}`,
          authRequired: !!op.authz?.required,
          rolesAny: op.authz?.rolesAny ?? [],
          description: `Operation: ${op.name}`
        });
      }
    }
  }
  return eps;
}

function buildDecisions(spec: any) {
  const decisions = [
    { title: "API style", reason: `REST chosen for broad client compatibility.` },
    { title: "Code generation", reason: `Deterministic templates used for repeatable output.` }
  ];

  if (spec.stack?.db === "postgres") decisions.push({ title: "Database", reason: "Postgres chosen for relational integrity and strong tooling." });
  if (spec.crossCutting?.auth?.mode === "jwt") decisions.push({ title: "Auth", reason: "JWT chosen for stateless API authentication." });

  return decisions;
}
```

---

## 8) Diagrams generator

**Path:** `src/core/generators/diagrams/mermaid/index.ts`

```ts
import path from "path";
import { renderToFile } from "../../../render/render";
import type { GenerationModel } from "../../../planner/types";

function tpl(name: string) {
  return path.join(process.cwd(), "src/core/generators/diagrams/mermaid/templates", name);
}

export function generateDiagrams(model: GenerationModel, spec: any) {
  renderToFile(
    tpl("components.mmd.hbs"),
    {
      domains: model.domains.map(d => ({
        className: d.className,
        label: spec.domains.find((x: any) => x.key === d.key)?.label ?? d.className
      })),
      authEnabled: model.authMode === "jwt"
    },
    path.join(model.outDir, "diagrams", "components.mmd")
  );

  // Per-domain class diagram
  for (const d of model.domains) {
    renderToFile(
      tpl("domain.mmd.hbs"),
      { entities: d.entities },
      path.join(model.outDir, "diagrams", `domain-${d.key}.mmd`)
    );
  }

  // Optional: one sequence diagram per operation
  for (const d of spec.domains ?? []) {
    for (const s of d.services ?? []) {
      for (const op of s.operations ?? []) {
        renderToFile(
          tpl("sequence.operation.mmd.hbs"),
          {
            method: op.method,
            path: `${s.route}${op.path}`,
            operationName: op.name
          },
          path.join(model.outDir, "diagrams", `sequence-${op.name}.mmd`)
        );
      }
    }
  }
}
```

---

# D) QA Gate / Build command (cross-platform)

## 9) `archon build` implementation

This runs `npm install` + `npm run build` in the generated repo.

**Path:** `src/cli/commands/build.ts`

```ts
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

function run(cmd: string, args: string[], cwd: string) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

export async function buildCmd(outDir: string) {
  if (!fs.existsSync(outDir)) {
    console.error(`Output dir not found: ${outDir}`);
    process.exit(1);
  }

  // If you generate package.json later, this just works.
  // For now, ensure generated repo has package.json.
  const pkg = path.join(outDir, "package.json");
  if (!fs.existsSync(pkg)) {
    console.error(`No package.json in ${outDir}. Generate app scaffolding first.`);
    process.exit(1);
  }

  console.log("==> Installing dependencies");
  run("npm", ["install"], outDir);

  console.log("==> Building");
  run("npm", ["run", "build"], outDir);

  console.log("✅ Build OK");
}
```

---

# E) Wire docs + diagrams into `generate`

In your existing `generateCmd`, add:

```ts
import { generateDocs } from "../../core/generators/docs/markdown";
import { generateDiagrams } from "../../core/generators/diagrams/mermaid";

// after generateNestJs(model):
generateDocs(model, spec);
generateDiagrams(model, spec);
```

Now your `archon generate` produces:

* `docs/*.md`
* `diagrams/*.mmd`
* `src/*` code

---

# F) One important fix: your code generator currently doesn’t emit app scaffolding

To run build, you need `package.json`, Nest bootstrap files, and TypeORM config.

If you want, I’ll provide the minimal v1 templates for:

* `package.json`
* `src/main.ts`
* `src/app.module.ts`
* `src/common/config/config.module.ts`
* `orm` config module using `DATABASE_URL`

