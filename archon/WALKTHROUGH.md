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
  - `dtos/*.dto.ts` (Data Transfer Objects)
- **Conditional CRUD**: Only generates endpoints specified in the spec's `crud` array.

### Authentication & Authorization
- **Zero-dependency verification** using `jose`.
- **Scope Enforcement**:
  - `JwtAuthGuard`: Extracts and normalizes scopes/permissions from token.
  - `ScopesGuard`: Enforces required scopes using `@Scopes()` decorator.
  - Controllers are automatically decorated with default scopes (e.g., `domain:read`, `domain:write`) or custom overrides (`authz.scopesAll`).
- Supports both **JWKS** (Auth0/OIDC) and **Shared Secret**.

### Documentation (Prompt-17 Implementation)
- Generates `docs/api.md` with **ready-to-paste Curl examples**.
- **Postman Ready**: uses `{{baseUrl}}` and `{{token}}` variables directly.
- Includes a token helper command for client credentials flow.

## 3. Verification Result
I ran a test using `sample-spec.json` (a Patient Notification system).

**Input (`sample-spec.json`):**
```json
{
  "name": "Validation App",
  "domains": [{ "name": "Patient", "key": "patient", ... }]
}
```

**Output Structure:**
```text
archon/
├── package.json
├── .env.example
├── src/
│   ├── app.module.ts              # Automatically imports PatientModule & uses DATABASE_URL
│   ├── auth/
│   │   ├── jwt.guard.ts           # The "jose" implementation + scope extraction
│   │   ├── scopes.guard.ts        # Enforces @Scopes()
│   │   ├── scopes.decorator.ts    # Decorator definition
│   │   └── jwt.config.ts
│   └── modules/
│       └── patient/
│           ├── controllers/       # PatientNotificationController w/ @Scopes
│           ├── services/
│           └── entities/
└── docs/
    └── api.md                     # Markdown with Curl commands & {{baseUrl}}
```

**Sample Controller Output (Verified):**
```typescript
@Patch('/toggle')
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('notifications:toggle')
async Toggle(@Body() body: any) { ... }
```

## 4. How to use it
1.  **Initialize**: `mkdir my-project && cd my-project && ../archon/bin/archon.ts init my-project`
2.  **Edit Spec**: Modify `designspec.json`.
3.  **Generate**: `../archon/bin/archon.ts generate`
4.  **Run**: `npm install && npm start`
