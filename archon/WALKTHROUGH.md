# Archon - System Architect CLI Walkthrough

I have implemented **Archon**, the CLI tool that turns a `DesignSpec` into a production-ready NestJS backend.

## 1. What was built
- **CLI (`archon/bin/archon.ts`)**: The entry point.
- **Generators (`archon/src/core/generator.ts`)**: Engine + Handlebars helpers.
- **Templates**: `src/templates/` (NestJS, Auth, Docs).

## 2. Capabilities & Fixes (V1 Stable)
### Correctness & Security (P0)
- **Correct Decorators**: Custom operations now use `@Get`, `@Post`, `@Patch` (via `nestjsMethod`) instead of invalid `@PATCH`.
- **Strict Authorization**: `ScopesGuard` enforces **ALL** required scopes using `.every()` and explicitly throws `ForbiddenException`.
- **DI Handling**: `AuthModule` correctly provides `Reflector` and exports `ScopesGuard` for functional injection.
- **Safe Imports**: Project configured with `esModuleInterop` to handle `fs-extra` robustly.

### Product Quality (P1)
- **documentation**: `docs/api.md` generation is now crisp, with **zero indentation artifacts** in code blocks.
- **Formatting**: `@Scopes` decorator generation handles arrays cleanly without whitespace issues.
- **Environment**: restored clean CLI environment (no accidental generated file leakage).

### Logic
- **Validation**: Schema (AJV) + Semantic checks.
- **Dry Run**: Preview changes with `--dry-run`.
- **Database**: Uses `DATABASE_URL` via TypeORM.

## 3. Verification Result
Tests run in `archon-out/` to avoid polluting source.

1.  **Build**: `npm run build` (Clean).
2.  **Generate**: `archon generate -s sample-spec.json` (Success). in `archon-out/`.
3.  **Inspect**:
    -   `PatientNotification.controller.ts`: `@Patch`, `@Scopes` (one-line) correct.
    -   `scopes.guard.ts`: `.every()` check + `throw` correct.
    -   `api.md`: No indentation errors.

## 4. How to use it
1.  **Build**: `cd archon && npm install && npm run build`
2.  **Generate**: `mkdir my-app && cd my-app`
3.  **Run**: `node ../archon/dist/bin/archon.js generate -s ../archon/sample-spec.json`
