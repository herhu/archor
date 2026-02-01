# Archon - System Architect CLI Walkthrough

I have implemented **Archon**, the CLI tool that turns a `DesignSpec` into a production-ready NestJS backend.

## 1. What was built
- **CLI (`archon/bin/archon.ts`)**: The entry point.
- **Generators (`archon/src/core/generator.ts`)**: Engine + Handlebars helpers.
- **Templates**: `src/templates/` (NestJS, Auth, Docs).

## 2. Capabilities & Fixes (V1.5 Final Polish)
### Correctness (P0)
- **Module Imports**: `AppModule` now correctly imports modules using their clean key-based paths (e.g. `./modules/patient/patient.module`).
- **Class Naming**: Module classes are strictly PascalCase (e.g. `PatientModule`), handling spaces in domain names correctly.
- **Controller Decorators**: Fixed duplicate decorators bug. Scopes are properly inline formatted.

### Polish & DX (P1)
- **Optional Auth**: Custom operations with `authz.required: false` no longer generate `UseGuards` decorators.
- **Entity Typing**: Primary keys with `int` type now generate `number` typescript fields.
- **Clean README**: Removed irrelevant migration commands.

## 3. Verification Result
Tests run in `archon-out/` using `sample-spec.json`.

1.  **Build**: `npm run build` (Templates copied correctly).
2.  **Generation**: `sample-spec.json` SUCCEEDED.
3.  **Inspect**:
    -   `PatientModule`: Correct class name `PatientModule`.
    -   `AppModule`: Correct import `./modules/patient/patient.module`.
    -   `Controller`: Clean decorators, `Status` op has no guards.
    -   `Entity`: ID is `number`.

## 4. How to use it
1.  **Build**: `cd archon && npm install && npm run build`
2.  **Generate**: `mkdir my-app && cd my-app`
3.  **Run**: `node ../archon/dist/bin/archon.js generate -s ../archon/sample-spec.json`
