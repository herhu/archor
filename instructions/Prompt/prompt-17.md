Alright — we’ll add **curl examples per endpoint** directly into `docs/api.md`, aligned with your auth + scopes model.

We’ll do it in a clean, deterministic way:

* Each endpoint row gets a **copy/paste curl** block
* Uses `{{baseUrl}}` and `{{token}}` so it matches Postman variables and `.env`
* For write endpoints with JSON body, include a minimal example body

---

# 1) Update `docs/api.md.hbs` to include curl blocks

Replace your `docs/api.md.hbs` with this:

**Path:** `src/core/generators/docs/markdown/templates/api.md.hbs`

````hbs
# API Reference — {{projectName}}

Base URL (default): `{{baseUrl}}`

Auth header:
- `Authorization: Bearer {{token}}`

---

## Endpoints

{{#each endpoints}}
### {{method}} `{{path}}`

**Auth:** {{#if authRequired}}Yes{{else}}No{{/if}}  
**Required scope:** {{scope}}  
**Description:** {{description}}

```bash
{{curl}}
````

{{/each}}

````

---

# 2) Enhance docs generator to compute curl per endpoint

Update `buildEndpoints(spec)` in:

`src/core/generators/docs/markdown/index.ts`

Replace the endpoint-building with a version that includes:
- `scope`
- `curl`
- optional example bodies

### Patch: add helpers inside the file
```ts
function defaultScope(domainKey: string, method: string) {
  const m = method.toUpperCase();
  return `${domainKey}:${m === "GET" ? "read" : "write"}`;
}

function curlForEndpoint(ep: {
  method: string;
  path: string;
  authRequired: boolean;
  scope: string;
  body?: any;
}) {
  const base = `curl -X ${ep.method} "{{baseUrl}}${ep.path}"`;
  const headers: string[] = [];
  if (ep.authRequired) headers.push(`-H "Authorization: Bearer {{token}}"`);
  if (ep.body) headers.push(`-H "Content-Type: application/json"`);

  const body = ep.body ? ` \\\n  -d '${JSON.stringify(ep.body, null, 2)}'` : "";

  const headerLines = headers.length ? " \\\n  " + headers.join(" \\\n  ") : "";
  return `${base}${headerLines}${body}`;
}

function exampleBodyForCrud(entity: any) {
  // entity is from DesignSpec domain.entities[0] in v1 mapping
  const ex: Record<string, any> = {};
  for (const f of entity?.fields ?? []) {
    const name = f.name;
    if (name === entity.primaryKey) continue;
    if (name === "createdAt" || name === "updatedAt") continue;

    switch (f.type) {
      case "boolean":
        ex[name] = true;
        break;
      case "int":
      case "float":
        ex[name] = 1;
        break;
      case "timestamp":
        ex[name] = new Date().toISOString();
        break;
      case "json":
        ex[name] = { example: true };
        break;
      default:
        ex[name] = `example_${name}`;
    }
  }
  return ex;
}
````

### Replace `buildEndpoints(spec)` with this:

```ts
function buildEndpoints(spec: any) {
  const eps: any[] = [];
  for (const d of spec.domains ?? []) {
    const domainKey = d.key;

    // v1: use first entity for body examples
    const entity = (d.entities ?? [])[0];
    const bodyCreate = entity ? exampleBodyForCrud(entity) : undefined;
    const bodyUpdate = bodyCreate;

    for (const s of d.services ?? []) {
      const route = s.route;
      const crud = new Set(s.crud ?? []);

      if (crud.has("create")) {
        const ep = {
          method: "POST",
          path: route,
          authRequired: true,
          scope: `${domainKey}:write`,
          description: "Create resource",
          body: bodyCreate
        };
        eps.push({ ...ep, curl: curlForEndpoint(ep) });
      }

      if (crud.has("findAll")) {
        const ep = {
          method: "GET",
          path: route,
          authRequired: true,
          scope: `${domainKey}:read`,
          description: "List resources"
        };
        eps.push({ ...ep, curl: curlForEndpoint(ep) });
      }

      if (crud.has("findOne")) {
        const ep = {
          method: "GET",
          path: `${route}/:id`,
          authRequired: true,
          scope: `${domainKey}:read`,
          description: "Get resource by id"
        };
        eps.push({ ...ep, curl: curlForEndpoint(ep) });
      }

      if (crud.has("update")) {
        const ep = {
          method: "PATCH",
          path: `${route}/:id`,
          authRequired: true,
          scope: `${domainKey}:write`,
          description: "Update resource",
          body: bodyUpdate
        };
        eps.push({ ...ep, curl: curlForEndpoint(ep) });
      }

      if (crud.has("delete")) {
        const ep = {
          method: "DELETE",
          path: `${route}/:id`,
          authRequired: true,
          scope: `${domainKey}:write`,
          description: "Delete resource"
        };
        eps.push({ ...ep, curl: curlForEndpoint(ep) });
      }

      // Custom operations
      for (const op of s.operations ?? []) {
        const scopesAll = op.authz?.scopesAll ?? [];
        const scope = scopesAll.length ? scopesAll.join(", ") : defaultScope(domainKey, op.method);

        const method = op.method;
        const path = `${route}${op.path}`;

        const ep = {
          method,
          path,
          authRequired: !!op.authz?.required,
          scope,
          description: `Operation: ${op.name}`,
          body: method === "GET" ? undefined : { "TODO": op.request?.schemaRef ?? "request body" }
        };
        eps.push({ ...ep, curl: curlForEndpoint(ep) });
      }
    }
  }
  return eps;
}
```

---

# 3) Update docs generator to pass baseUrl/token placeholders

In `generateDocs(...)`, when rendering API doc, pass:

```ts
renderToFile(
  tpl("api.md.hbs"),
  {
    projectName: model.projectName,
    baseUrl: "{{baseUrl}}",
    token: "{{token}}",
    endpoints
  },
  path.join(model.outDir, "docs", "api.md")
);
```

That ensures curl blocks match your Postman environment variables.

---

# 4) Resulting output example (what clients see)

For `notifications` domain:

```bash
curl -X GET "{{baseUrl}}/notifications/settings" \
  -H "Authorization: Bearer {{token}}"
```

For create:

```bash
curl -X POST "{{baseUrl}}/notifications/settings" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "example_customerId",
    "enabled": true,
    "portalUrl": "example_portalUrl"
  }'
```

---

# 5) One more professional touch (optional)

Add a **“Token setup”** curl block at the top if `tokenUrl` exists in env (client credentials). If you want, I’ll add it.

---

Done. Below is a **token curl helper** that drops straight into your docs generator so clients can **copy–paste one command**, get a token, and immediately use the rest of the curl examples.

---

## 1) Update `docs/api.md.hbs` — add Token Helper section

**Path:** `src/core/generators/docs/markdown/templates/api.md.hbs`
Add this section **at the top**, before “Endpoints”.

````hbs
# API Reference — {{projectName}}

Base URL (default): `{{baseUrl}}`

---

## Authentication — Get a Token (Client Credentials)

If your IdP supports **OAuth2 Client Credentials**, run:

```bash
curl -X POST "{{tokenUrl}}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id={{clientId}}" \
  -d "client_secret={{clientSecret}}" \
  -d "scope={{scope}}"
````

**Then copy `access_token` from the response and set:**

```bash
export TOKEN="<access_token>"
```

All examples below assume:

```bash
-H "Authorization: Bearer {{token}}"
```

> **Scopes convention (domain-based):**
>
> * Read: `notifications:read`
> * Write: `notifications:write`
> * Custom operations may require overrides (documented per endpoint).

---

## Endpoints

{{#each endpoints}}

### {{method}} `{{path}}`

**Auth:** {{#if authRequired}}Yes{{else}}No{{/if}}
**Required scope:** {{scope}}
**Description:** {{description}}

```bash
{{curl}}
```

{{/each}}

````

---

## 2) Pass token variables to the template

In `generateDocs(...)`, pass these placeholders so they match Postman + env:

```ts
renderToFile(
  tpl("api.md.hbs"),
  {
    projectName: model.projectName,
    baseUrl: "{{baseUrl}}",
    token: "{{token}}",
    tokenUrl: "{{tokenUrl}}",
    clientId: "{{clientId}}",
    clientSecret: "{{clientSecret}}",
    scope: "{{scope}}",
    endpoints
  },
  path.join(model.outDir, "docs", "api.md")
);
````

---

## 3) Ensure `.env.example` and Postman env already align

You already have these (good). Confirm they exist:

```env
# OAuth (optional)
TOKEN_URL=https://example.com/oauth/token
CLIENT_ID=
CLIENT_SECRET=
SCOPE=notifications:read notifications:write
```

Postman env keys:

* `tokenUrl`
* `clientId`
* `clientSecret`
* `scope`
* `token`

Docs + Postman now reference **the same variable names**.

---

## 4) What the client experience looks like (why this sells)

1. Copy **one curl** → get token
2. `export TOKEN=...`
3. Copy any endpoint curl → works

No guesswork. No emails. No back-and-forth.

---

## 5) Optional (nice-to-have, say the word)

* **PKCE curl helper** (for public clients)
* **Azure AD / Auth0-specific curl examples**
* **Makefile** with `make token` / `make call`

If you want to ship Phase 1 fast, you’re done here.
