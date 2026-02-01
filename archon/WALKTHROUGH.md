# Archon - System Architect CLI Walkthrough

I have implemented **Archon**, the CLI tool that turns a `DesignSpec` into a production-ready NestJS backend.

## 1. What was built
- **CLI (`archon/bin/archon.ts`)**: The entry point for commands.
- **Generators (`archon/src/core/generator.ts`)**: The engine that reads `designspec.json` and produces files.
- **Templates (`archon/src/templates`)**: Handlebars templates for NestJS, Auth (Jose), and Docs.

## 2. Capabilities
### Backend Scaffolding
- Generates a full NestJS project (`package.json`, `tsconfig.json`, `main.ts`, `app.module.ts`).
- **Database**: Configured to use `DATABASE_URL` environment variable for simple connection string management.

### Module Generation
- For each domain in the spec, it creates:
  - `entities/*.entity.ts` (TypeORM)
  - `services/*.service.ts` (CRUD logic)
  - `controllers/*.controller.ts` (API endpoints + Auth guards)
  - **Correct Decorators**: Uses `@Get`, `@Post`, `@Patch` correctly.
- **Conditional CRUD**: Only generates endpoints specified in the spec's `crud` array.

### Authentication & Authorization (Secured)
- **Zero-dependency verification** using `jose`.
- **Scope Enforcement**:
  - `ScopesGuard`: Enforces **ALL** required scopes (`every`) for stricter security.
  - Automatically wired in `AuthModule` (guards exported).
  - Controllers decorated with `@Scopes('s1', 's2')`.

### Documentation (Cleaned)
- Generates `docs/api.md` with **ready-to-paste Curl examples**.
- Formatting is strictly controlled (markdown blocks are clean).
- **Postman Ready**: uses `{{baseUrl}}` and `{{token}}` variables directly.

### Robustness Features
- **Validation**:
  - **Schema**: Validates JSON structure (AJV).
  - **Semantic**: Checks for duplicate domains, invalid scope formats, etc.
- **Dry Run**: `archon generate --dry-run` previews file creation without writing.
- **Stable Tooling**: `tsconfig.json` configured for proper CommonJS/ESM interop (`fs-extra` support).

## 3. Verification Result
I ran tests using `sample-spec.json` and `invalid-spec.json`.

**Verification Steps:**
1.  `npm run build`: Success (TS clean).
2.  `archon generate --dry-run`: Success (Logs "Would create...").
3.  `archon generate -s invalid-spec.json`: Failed correctly ("Duplicate domain key").
4.  `archon generate -s sample-spec.json`: Success.

**Verified Output (`docs/api.md`):**
```markdown
## Authentication — Get a Token (Client Credentials)
If your IdP supports **OAuth2 Client Credentials**, run:
```bash
curl -X POST "{{tokenUrl}}" ...
```
(No indentation artifacts)
```

**Verified Output (`PatientNotification.controller.ts`):**
```typescript
@Patch('/toggle')
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('notifications:toggle')
async Toggle(...)
```

## 4. How to use it
1.  **Initialize**: `mkdir my-project && cd my-project && ../archon/bin/archon.ts init my-project`
2.  **Edit Spec**: Modify `designspec.json`.
3.  **Preview**: `../archon/bin/archon.ts generate --dry-run`
4.  **Generate**: `../archon/bin/archon.ts generate`
5.  **Run**: `npm install && npm start`
