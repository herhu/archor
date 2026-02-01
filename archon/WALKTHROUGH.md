# Archon - System Architect CLI Walkthrough

I have implemented **Archon**, the CLI tool that turns a `DesignSpec` into a production-ready NestJS backend.

## 1. What was built
- **CLI (`archon/bin/archon.ts`)**: The entry point.
- **Generators (`archon/src/core/generator.ts`)**: Engine + Handlebars helpers.
- **Templates**: `src/templates/` (NestJS, Auth, Docs).

## 2. Capabilities & Fixes (V1.3 Final Polish)
### Correctness & Security (P0)
- **Strict JWT**: Now **fails fast** (throws Error) if `JWT_ISSUER`, `JWT_AUDIENCE`, or `JWT_JWKS_URI` (in jwks mode) are missing.
- **Custom Ops**: Correctly handles `@Body()` conditional rendering. `GET/DELETE` operations no longer accept a body argument.
- **Validation**:
  - **Schema**: Enforced `additionalProperties: false`, strict Enums for methods/types.
  - **Semantic**: Verified `service.entity` references exist in domain.
- **Strict Scope**: `ScopesGuard` explicitly throws `ForbiddenException`.

### Product Quality (P1)
- **Formatting**: Controller templates now properly indented. Custom operation arguments are clean (no whitespace artifacts).
- **Type Safety**:
  - **Entities**: Mapped `int` -> `number`, `uuid` -> `@Column({ type: 'uuid' })`, `json` -> `@Column({ type: 'json' })`.
  - **Reference**: Services now resolve specific entities via `service.entity`, fixing the `entities[0]` assumption.
- **Runtime Validation**: Application now enables `ValidationPipe` globally (`whitelist: true`) in `main.ts`.

## 3. Verification Result
Tests run in `archon-out/` using `sample-spec.json` (updated with `json` fields and `GET` ops).

1.  **Build**: `npm run build` (Clean).
2.  **Generate**: `archon generate -s sample-spec.json` (Success).
3.  **Inspect**:
    -   `PatientNotification.entity.ts`: `meta: any` is `json` type. `id` is `uuid`.
    -   `PatientNotificationService.controller.ts`: `Toggle` accepts body, `Status` (GET) does not.
    -   `main.ts`: `app.useGlobalPipes(...)` present.
    -   `jwt.config.ts`: Verified throw logic.

## 4. How to use it
1.  **Build**: `cd archon && npm install && npm run build`
2.  **Generate**: `mkdir my-app && cd my-app`
3.  **Run**: `node ../archon/dist/bin/archon.js generate -s ../archon/sample-spec.json`
