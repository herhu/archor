## Milestone tag

**Milestone: M1.5 — “Platform Baseline (Enterprise NestJS Template)”**
Goal: bake “real backend platform” defaults into your generator template so every CRUD module ships production-grade *by construction*.

Everything below is extracted directly from the mentee repo structure and patterns. 

---

# What we need to add to our template (extracted from mentee repo)

## A) Bootstrap & Global App Wiring

### 1) `main.ts` production bootstrap

Add these global defaults (they’re already used in the repo):

* **Global prefix**: `app.setGlobalPrefix('api/v1')` 
* **Global ValidationPipe** with strict options:

  * `whitelist: true`
  * `forbidNonWhitelisted: true`
  * `transform: true`
  * custom `exceptionFactory` producing structured validation errors 
* **Global interceptor** to serialize responses via `class-transformer` (`instanceToPlain`) 
* **Global exception filter** registration (see section D) 
* **Cookie parsing** (`cookie-parser`) for JWT-in-cookie flows 
* **CORS** with credentials + allowlist origins 
* **Swagger** setup + version from `package.json` 
* **HTTPS options loader** (local certs) for local secure-cookie parity 

✅ **Template impact**: generate a “platform-grade” `main.ts` once; all modules inherit.

---

## B) AppModule Platform Modules (cross-cutting)

### 2) Config as a real platform layer

Add:

* `@nestjs/config` with Joi validation schema and `envFilePath: '.env'` 
* Centralized config consts for the whole app (`CONFIG_MODULE_OPTIONS`) 

✅ **Template impact**: your generator should output:

* `src/shared/consts/app-module-consts/appModuleOptions.ts`
* `src/shared/consts/app-config-consts/...`

---

### 3) Logging (structured, production-ready)

Add:

* `nestjs-pino` logger module config with:

  * redaction for auth headers/cookies
  * pretty transport only outside prod
  * custom serializers including `correlationId` 

✅ **Template impact**: you get consistent JSON logs + safe redaction by default.

---

### 4) Rate limiting (global + per-route)

Add:

* `@nestjs/throttler` global guard in `AppModule` (APP_GUARD ThrottlerGuard) 
* Optional per-endpoint overrides using `@Throttle()` (auth endpoints) 

✅ **Template impact**: add throttling globally + allow module-level overrides.

---

### 5) Correlation ID middleware

Add:

* `x-correlation-id` middleware that:

  * accepts inbound header OR generates UUID
  * adds to request + response headers
  * makes it available to logging serializers 

✅ **Template impact**: massively improves debugging, tracing, and support.

---

## C) Health / Readiness (deployment-grade)

### 6) Health module

Add `/health` (liveness) and `/health/ready` (readiness with DB check + 503 when DB down) 
Also add unit tests for health (they exist) 

✅ **Template impact**: your generated backend is immediately deployable behind load balancers / k8s probes.

---

## D) Error handling & API response shaping

### 7) Global HTTP exception filter

Add a filter that:

* logs structured error metadata (status, path, message)
* returns consistent response envelope (`statusCode`, `message`, `path`, `timestamp`) 

⚠️ **One improvement to apply when templating**:
The filter is registered as a provider but should ideally be wired as `APP_FILTER` (or `useGlobalFilters(app.get(...))` like they did). Keep the current approach but in our template prefer an explicit global setup in `main.ts` (cleaner). 

---

### 8) Global transform interceptor

Add `TransformInterceptor` so `@Exclude()` in entities/DTOs is respected and you avoid leaking secrets. 

✅ **Template impact**: consistent response serialization and safe redaction.

---

## E) Auth system (this is a big extraction)

### 9) Key management + signing strategy

Add:

* Keypair loader/provider using `jose` (`importPKCS8` / `importSPKI`) with injected `JWT_KEY_PAIR` 
* Key generation script (`scripts/token-keygen/genKeys.js`) 
* `.env.example` containing JWT paths, issuer/audience, cookie policy 
* ADR documenting strategy (this is gold for your product) 
* Mermaid sequence diagram (`docs/diagrams/auth-refresh.mmd`) 

✅ **Template impact**: your generator should optionally scaffold an “AuthPack”:

* keys provider
* auth module with sign-in/refresh/logout
* docs/adr + diagrams for credibility

---

### 10) Cookie-based JWT flow

Add:

* `cookieExtractor()` helper 
* Cookie setup constants (HttpOnly, SameSite, Secure, path) 
* `cookie-parser` middleware (already covered) 

✅ **Template impact**: supports browser apps cleanly (SPA + refresh cookies).

---

### 11) Guards (access + refresh)

Add:

* `JwtGuard` verifying JWT using `jose.jwtVerify`, issuer, audience, EdDSA alg, and attaching `req.user` 
* `JwtRefreshGuard` validating refresh token (hashed refresh token stored in DB) 

⚠️ **Important bug/design fix to apply in our template**:
The refresh guard uses `decodeJwt(accessToken)` instead of verifying signature for refresh flow. In your template, refresh should validate RT strongly and use the RT as the authority, not an unverified AT. (We’ll fix this in our baseline implementation.)

---

### 12) Password hashing + refresh token storage

Add:

* Argon2id password hashing utilities with tunable params via env 
* Store hashed refresh token + expiry in the User entity 
* Token signer creating:

  * access token (JWT)
  * refresh token (random bytes hex) + jti (uuid) 

✅ **Template impact**: strong security posture out of the box.

---

## F) Config architecture patterns to template

### 13) Central “Options constants”

They centralize options here:

* `CONFIG_MODULE_OPTIONS`
* `TYPEORM_MODULE_OPTIONS`
* `LOGGER_MODULE_OPTIONS`
* `THROTTLER_MODULE_OPTIONS` 

✅ **Template impact**: your generator should create this “options hub” automatically; it’s clean and scalable.

---

## G) DevEx / Ops: Docker + CI + Git hooks

### 14) Docker baseline

Add:

* `Dockerfile` dev-runner (Node 20 alpine, nest cli, start:dev) 
* `docker-compose.yml` with:

  * app + Postgres 16
  * environment variables
  * volume mount for local dev 
* `.dockerignore` 

✅ **Template impact**: one-command local run.

---

### 15) CI pipeline baseline

Add `.gitlab-ci.yml` pipeline with:

* node_modules tracking check
* prettier check
* eslint
* tests
* (and an example deploy job) 

✅ **Template impact**: your generated repo looks “real” to teams instantly.

---

### 16) Pre-commit hooks

Add `.husky/pre-commit` running:

* tests
* prettier on staged files
* eslint fix on staged files 

✅ **Template impact**: reduces regressions, enforces quality.

---

## H) Swagger baseline

Add Swagger builder + `addBearerAuth()` and endpoint at `/api`. 

✅ **Template impact**: instant discoverability for customers.

---

# What becomes “Template Defaults” vs “Optional Packs”

## Defaults (always generated)

These are the “you’re a serious backend” essentials:

1. ConfigModule + Joi validation
2. Logger (nestjs-pino) + redaction
3. Global ValidationPipe strict
4. Global TransformInterceptor
5. Global HttpExceptionFilter
6. Correlation ID middleware
7. Health module (liveness + readiness)
8. Throttler (global)
9. Swagger baseline
10. Dockerfile + docker-compose

(All evidenced in repo.) 

---

## Optional packs (generated by flags)

1. **AuthPack** (keys, JWT cookies, refresh rotation, guards, ADR + diagram) 
2. **SocketPack** (gateway/module) 
3. **CI Pack** (gitlab-ci + husky) 

---

# Milestone Deliverable Output (what you add to your generator spec)

Add a `platform` block to your DesignSpec so the generator can toggle features:

```yaml
platform:
  cors: true
  validationPipe: strict
  exceptionFilter: true
  transformInterceptor: true
  correlationId: true
  logging: pino
  throttling: true
  health: { liveness: true, readinessDb: true }
  swagger: true
  docker: true
  ci: optional
  authPack: optional
  socketPack: optional
```

---

If you want, next message I’ll translate this into **exact generator tasks** (what templates to create, what folders, what defaults), so you can implement M1.5 as a clean PR with a checklist.
