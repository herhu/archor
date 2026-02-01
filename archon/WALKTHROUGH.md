# Archon - System Architect CLI Walkthrough

I have implemented **Archon**, the CLI tool that turns a `DesignSpec` into a production-ready NestJS backend.

## 1. What was built
- **CLI (`archon/bin/archon.ts`)**: The entry point.
- **Generators (`archon/src/core/generator.ts`)**: Engine + Handlebars helpers.
- **Templates**: `src/templates/` (NestJS, Auth, Docs).

## 2. Capabilities & Fixes (V1.4 Production Hardening)
### Correctness & Security (P0)
- **Schema Hardening**: "LLM-proof" validation using AJV.
  - **Regex Enforcement**: Routes (no leading slash), Paths (leading slash required), Scopes (format `domain:action`).
  - **Semantic Integrity**: Fails if domain has multiple entities but service doesn't specify `service.entity`.
- **Strict JWT**: Fails fast if configuration is missing.
- **Strict Scope**: `ScopesGuard` explicitly throws `ForbiddenException`.

### Product Quality (P1)
- **Formatting**: Controller clean indentation.
- **Type Safety**: Improved Entity typing (`json`, `uuid`, `number`).
- **DX**:
  - **README.md**: Auto-generated with Setup, Run, Test, and Auth instructions.
  - **ValidationPipe**: Global validation enabled by default.

## 3. Verification Result
Tests run in `archon-out/` using `sample-spec.json` (valid) and `ambiguous-spec.json` (invalid).

1.  **Build**: `npm run build` (Clean).
2.  **Validation Test**: `ambiguous-spec.json` correctly FAILED validation.
3.  **Generation Test**: `sample-spec.json` SUCCEEDED.
4.  **Inspect**:
    -   `README.md`: Created and populated.
    -   `PatientNotification.entity.ts`: Correct typing.
    -   `PatientNotificationService.controller.ts`: Correct conditional `@Body`.

## 4. How to use it
1.  **Build**: `cd archon && npm install && npm run build`
2.  **Generate**: `mkdir my-app && cd my-app`
3.  **Run**: `node ../archon/dist/bin/archon.js generate -s ../archon/sample-spec.json`
