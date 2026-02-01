Below is a **Generator Plan v1** that’s implementable fast and aligns with **DesignSpec v1** as the single contract.

You’ll end Phase 1 with: `designspec.json → repo + docs + diagrams + (optional) postman/openapi`.

---

# 1) Generator v1 architecture

```text
DesignSpec v1 (validated JSON)
        |
        v
[Planner]  -> builds an internal "GenerationModel" (normalized paths, names, DTO list)
        |
        v
[Renderers]
  - CodeRenderer (NestJS)
  - DocsRenderer (Markdown)
  - DiagramRenderer (Mermaid)
  - (Optional) PostmanRenderer
  - (Optional) OpenApiRenderer (or let Nest Swagger emit it later)
        |
        v
[QA Gate]
  - npm lint / tsc / tests / build
  - if fail -> Repair Loop (v1 optional)
```

**Key principle:** LLM outputs spec; generator outputs files. No LLM-written code in v1.

---

# 2) CLI commands (Phase 1)

### `archon init <project>`

Creates workspace and config.

### `archon new`

Interactive wizard -> produces `designspec.json` (can call LLM or accept manual entry).

### `archon generate [--out output]`

Reads `designspec.json`, validates, generates artifacts.

### `archon validate`

Validates JSON schema only (fast).

### `archon build`

Runs QA gate (install deps + compile). (Optional in v1 but recommended.)

**Minimal** for money-phase: `new` + `generate`.

---

# 3) Folder structure (tool + templates)

```text
archon/
  src/
    cli/
      index.ts
      commands/
        init.ts
        new.ts
        generate.ts
        validate.ts
        build.ts
    core/
      schema/
        designspec.v1.schema.json
      planner/
        toGenerationModel.ts
        naming.ts
        paths.ts
      render/
        render.ts
        writers.ts
      generators/
        code/
          nestjs/
            index.ts
            templates/
              app.module.hbs
              main.ts.hbs
              domain.module.hbs
              entity.typeorm.hbs
              dto.create.hbs
              dto.update.hbs
              controller.crud.hbs
              controller.ops.hbs
              service.hbs
              repository.hbs
              auth.module.hbs
              auth.guard.hbs
              roles.decorator.hbs
              rbac.guard.hbs
              errors.filter.hbs
              config.module.hbs
              env.example.hbs
              package.json.hbs
              tsconfig.json.hbs
              eslint.hbs
              jest.config.hbs
              dockerfile.hbs
              docker-compose.hbs
        docs/
          markdown/
            architecture.md.hbs
            api.md.hbs
            decisions.md.hbs
        diagrams/
          mermaid/
            components.mmd.hbs
            domain.mmd.hbs
            sequence.mmd.hbs
        postman/
          collection.json.hbs
  package.json
```

Use any template engine (Handlebars/EJS/Mustache). Keep it boring.

---

# 4) GenerationModel (internal normalized representation)

You don’t want your templates reading raw DesignSpec everywhere. Create a normalized model:

```ts
type GenerationModel = {
  projectName: string;
  outDir: string;
  stack: { orm: "typeorm"; framework: "nestjs"; db: "postgres" };
  domains: Array<{
    key: string;                // notifications
    className: string;          // Notifications
    baseRoute: string;          // /notifications
    modulePath: string;         // src/modules/notifications
    entities: Array<{
      name: string;             // NotificationSetting
      table: string;            // notification_setting
      fileName: string;         // notification-setting.entity.ts
      fields: Array<{
        name: string;
        tsType: string;         // string | boolean | number | Date | any
        columnType: string;     // TypeORM column type usage
        required: boolean;
        unique: boolean;
        maxLength?: number;
        isPrimary: boolean;
      }>;
    }>;
    services: Array<{
      key: string;              // notification-settings
      className: string;        // NotificationSettings
      route: string;            // /notifications/settings
      controllerFile: string;
      serviceFile: string;
      repoFile: string;
      crud: string[];
      operations: Array<{
        name: string;           // toggleEnabled
        method: string;         // PATCH
        path: string;           // /:id/toggle
        authRequired: boolean;
        rolesAny: string[];
        requestRef: string;     // #/dtos/ToggleEnabledDto
        responseRef: string;    // #/entities/NotificationSetting
      }>;
    }>;
  }>;
  crossCutting: { authMode: "jwt" | "none"; rbac: { enabled: boolean; roles: string[] } };
  envVars: Array<{ key: string; required: boolean; description: string; example?: string }>;
  errorMap: Array<{ code: string; httpStatus: number; message: string }>;
};
```

**Planner job:** convert to this model + derive names/paths.

---

# 5) Template list: minimal set (v1)

## A) Base app scaffolding (always generated)

1. `src/main.ts`
2. `src/app.module.ts`
3. `package.json`
4. `tsconfig.json`
5. `.eslintrc.*` (or eslint config)
6. `jest.config.*`
7. `Dockerfile`
8. `docker-compose.yml`
9. `.env.example`

## B) Cross-cutting

10. `src/common/config/config.module.ts`
11. `src/common/errors/http-exception.filter.ts`
12. `src/common/errors/error-map.ts`
13. Auth (if jwt):

* `src/auth/auth.module.ts`
* `src/auth/jwt.strategy.ts` (or guard-only approach)
* `src/auth/jwt.guard.ts`

14. RBAC (if enabled):

* `src/auth/roles.decorator.ts`
* `src/auth/rbac.guard.ts`

## C) Domain module skeleton per domain

15. `src/modules/<domain>/ <domain>.module.ts`

## D) Entity + DTOs per entity

16. `src/modules/<domain>/entities/<entity>.entity.ts`
17. `src/modules/<domain>/dtos/create-<entity>.dto.ts`
18. `src/modules/<domain>/dtos/update-<entity>.dto.ts`

## E) Service layer per service

19. `src/modules/<domain>/<service>/<service>.controller.ts`
20. `src/modules/<domain>/<service>/<service>.service.ts`
21. `src/modules/<domain>/<service>/<service>.repository.ts` (optional; recommended for clean separation)

That’s enough to sell.

---

# 6) Deterministic route generation rules

For each `service`:

### CRUD endpoints (REST)

Assume resource name from service key; simplest:

* `POST   <service.route>` → create
* `GET    <service.route>` → findAll
* `GET    <service.route>/:id` → findOne
* `PATCH  <service.route>/:id` → update
* `DELETE <service.route>/:id` → delete

For each `operation`:

* Endpoint = `<service.route>` + `<operation.path>`
* Method = operation.method

**Authz decoration rule:**

* If `operation.authz.required` → `@UseGuards(JwtGuard, RbacGuard?)`
* If rolesAny non-empty → `@Roles(...)`

---

# 7) Spec → files mapping table

| DesignSpec field              | Generator responsibility | Output                                     |
| ----------------------------- | ------------------------ | ------------------------------------------ |
| `project.name`                | project naming           | folder name, README title                  |
| `stack.*`                     | choose template variants | TypeORM vs Prisma (v1 choose TypeORM only) |
| `constraints.*`               | docs only (v1)           | `docs/architecture.md` notes               |
| `domains[].key/baseRoute`     | module + routes          | `modules/<domain>/*.ts`                    |
| `entities[]`                  | ORM + DTOs               | entity + create/update DTO files           |
| `services[].crud`             | controller methods       | CRUD handlers wired to service             |
| `services[].operations[]`     | custom endpoints         | extra controller methods                   |
| `crossCutting.auth`           | auth scaffolding         | auth module/guards                         |
| `crossCutting.errors.map`     | error helper             | error map + filter                         |
| `crossCutting.config.envVars` | config + env             | `.env.example` + config module             |
| `deliverables.*`              | toggles                  | whether to emit docs/diagrams              |

---

# 8) Docs generator v1 (sell value fast)

Generate these Markdown docs from spec:

1. `docs/architecture.md`

* Overview
* Components
* Auth approach
* Data model summary
* Key endpoints
* Decisions (brief)

2. `docs/api.md`

* Table: method/path/auth/description

3. `docs/decisions.md`

* bullet decision log (“why Postgres”, “why JWT”, etc.)

This is *what makes it feel like consulting deliverable*.

---

# 9) Diagram generator v1 (Mermaid)

Generate at least:

* `diagrams/components.mmd` (pipeline + services)
* `diagrams/domain-<domain>.mmd` (entities + relations)
* `diagrams/sequence-<operation>.mmd` (one or two key flows)

Keep it simple; Mermaid renders everywhere.

---

# 10) QA gate v1 (minimum)

After generating:

```bash
npm install
npm run lint
npm run build
```

If lint/build fails: fail fast and output diagnostics (repair loop can be v1.1).

This is how you avoid shipping embarrassment.

---

# 11) Implementation order (fastest to working PoC)

**Day 1**

1. `validate` command (schema validation)
2. `generate` command skeleton + file writer
3. base scaffolding templates (main/app module/package)

**Day 2**
4. domain module generation
5. entity + DTO generation (TypeORM)

**Day 3**
6. CRUD controller/service/repo generation

**Day 4**
7. auth + rbac templates
8. docs + diagram output

**Day 5**
9. QA gate automation + one demo repo output

That’s shippable Phase 1.

---

## If you want, next I can give you the **exact template contracts** for:

* `entity.typeorm.hbs`
* `controller.crud.hbs`
* `service.hbs`
* `auth.guard.hbs`

…and the naming/path helpers (kebab-case, PascalCase, route normalization), so you can implement without guessing.
