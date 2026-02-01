# Archon - System Architect CLI Walkthrough

I have implemented **Archon**, the CLI tool that turns a `DesignSpec` into a production-ready NestJS backend.

## 1. What was built
- **CLI (`archon/bin/archon.ts`)**: The entry point for commands.
- **Generators (`archon/src/core/generator.ts`)**: The engine that reads `designspec.json` and produces files.
- **Templates (`archon/src/templates`)**: Handlebars templates for NestJS, Auth (Jose), and Docs.

## 2. Capabilities
### Backend Scaffolding
- Generates a full NestJS project (`package.json`, `tsconfig.json`, `main.ts`, `app.module.ts`).
- Wires up TypeORM with Postgres credentials from `.env`.

### Module Generation
- For each domain in the spec, it creates:
  - `entities/*.entity.ts` (TypeORM)
  - `services/*.service.ts` (CRUD logic)
  - `controllers/*.controller.ts` (API endpoints + Auth guards)
  - `dtos/*.dto.ts` (Data Transfer Objects)

### Authentication (Prompt-10 Implementation)
- **Zero-dependency verification** using `jose`.
- Supports both **JWKS** (Auth0/OIDC) and **Shared Secret**.
- Enforces scoped access (e.g., `patient:read`, `patient:write`) in documentation.

### Documentation (Prompt-17 Implementation)
- Generates `docs/api.md` with **ready-to-paste Curl examples**.
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
│   ├── app.module.ts              # Automatically imports PatientModule
│   ├── auth/
│   │   ├── jwt.guard.ts           # The "jose" implementation
│   │   └── jwt.config.ts
│   └── modules/
│       └── patient/
│           ├── controllers/       # PatientNotificationController
│           ├── services/
│           └── entities/
└── docs/
    └── api.md                     # Markdown with Curl commands
```

**Sample API Doc Output (Verified):**
```bash
curl -X POST "{{baseUrl}}/notifications" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
  "customerId": "example_customerId",
  "enabled": true,
  "portalUrl": "example_portalUrl"
}'
```

## 4. How to use it
1.  **Initialize**: `mkdir my-project && cd my-project && ../archon/bin/archon.ts init my-project`
2.  **Edit Spec**: Modify `designspec.json`.
3.  **Generate**: `../archon/bin/archon.ts generate`
4.  **Run**: `npm install && npm start`
