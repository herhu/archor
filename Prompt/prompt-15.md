Good — we’ll generate a **Postman collection v1** that matches your API + auth/scopes story:

* Folders per **domain**
* Requests per **service CRUD** + **operations**
* Automatically sets `Authorization: Bearer {{token}}`
* Includes optional **OAuth2 token fetch** request + helper scripts
* Annotates required **scopes** in request description (domain-based + overrides)

---

# 1) Decide what Postman should output (v1)

Generated file:

```
postman/collection.json
```

Collection variables:

* `baseUrl` (default `http://localhost:3000`)
* `token` (Bearer token)
* `clientId`, `clientSecret` (optional)
* `tokenUrl` (optional)
* `scope` (optional)

Auth:

* Each request includes header `Authorization: Bearer {{token}}`

Optional token request:

* “Auth / Get Token (Client Credentials)” request (if you want; good default)

---

# 2) Postman template (Handlebars)

Create:
`src/core/generators/postman/templates/collection.json.hbs`

```hbs
{
  "info": {
    "name": "{{projectName}} (Generated)",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "description": "Generated from DesignSpec v1. Scopes are domain-based (e.g., notifications:read/write) unless overridden per operation."
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000" },
    { "key": "token", "value": "" },
    { "key": "tokenUrl", "value": "" },
    { "key": "clientId", "value": "" },
    { "key": "clientSecret", "value": "" },
    { "key": "scope", "value": "" }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// If token is empty, requests will likely fail with 401.",
          "// Set {{token}} manually or use the Auth -> Get Token request (if configured)."
        ]
      }
    }
  ],
  "item": [
    {
      "name": "Auth",
      "description": "Optional helpers to acquire/set a token.",
      "item": [
        {
          "name": "Get Token (Client Credentials)",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/x-www-form-urlencoded" }
            ],
            "url": {
              "raw": "{{tokenUrl}}",
              "host": [ "{{tokenUrl}}" ]
            },
            "body": {
              "mode": "urlencoded",
              "urlencoded": [
                { "key": "grant_type", "value": "client_credentials" },
                { "key": "client_id", "value": "{{clientId}}" },
                { "key": "client_secret", "value": "{{clientSecret}}" },
                { "key": "scope", "value": "{{scope}}" }
              ]
            },
            "description": "Set tokenUrl/clientId/clientSecret/scope variables. This request saves access_token into {{token}} automatically."
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "let json = {};",
                  "try { json = pm.response.json(); } catch (e) {}",
                  "const access = json.access_token || json.id_token;",
                  "if (access) {",
                  "  pm.collectionVariables.set('token', access);",
                  "  console.log('Saved token to collection variable: token');",
                  "} else {",
                  "  console.warn('No access_token found in response');",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    },

    {{#each domains}}
    {
      "name": "{{label}}",
      "description": "Domain: {{key}}. Default scopes: {{key}}:read for GET, {{key}}:write for POST/PATCH/DELETE.",
      "item": [
        {{#each services}}
        {
          "name": "{{label}}",
          "item": [
            {{#if hasCreate}}
            {{> requestItem name="Create" method="POST" path=route scope=(concat ../key ":write") bodyExample=bodyExampleCreate }},
            {{/if}}
            {{#if hasFindAll}}
            {{> requestItem name="Find All" method="GET" path=route scope=(concat ../key ":read") }},
            {{/if}}
            {{#if hasFindOne}}
            {{> requestItem name="Find One" method="GET" path=(concat route "/:id") scope=(concat ../key ":read") }},
            {{/if}}
            {{#if hasUpdate}}
            {{> requestItem name="Update" method="PATCH" path=(concat route "/:id") scope=(concat ../key ":write") bodyExample=bodyExampleUpdate }},
            {{/if}}
            {{#if hasDelete}}
            {{> requestItem name="Delete" method="DELETE" path=(concat route "/:id") scope=(concat ../key ":write") }},
            {{/if}}

            {{#each operations}}
            {{> requestItem
                name=(concat "Op: " name)
                method=method
                path=(concat ../route path)
                scope=(opScope ../..key method scopesAll)
                bodyExample=bodyExample
            }}{{#unless @last}},{{/unless}}
            {{/each}}
          ]
        }{{#unless @last}},{{/unless}}
        {{/each}}
      ]
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

This uses partials + helpers. Add them next.

---

# 3) Postman partial: a single request item

Create:
`src/core/generators/postman/templates/_partials/requestItem.hbs`

```hbs
{
  "name": "{{name}}",
  "request": {
    "method": "{{method}}",
    "header": [
      { "key": "Authorization", "value": "Bearer {{token}}" }
      {{#if hasJsonBody}},{ "key": "Content-Type", "value": "application/json" }{{/if}}
    ],
    "url": {
      "raw": "{{baseUrl}}{{path}}",
      "host": [ "{{baseUrl}}" ],
      "path": [ "{{postmanPathSegments path}}" ]
    }{{#if hasJsonBody}},
    "body": {
      "mode": "raw",
      "raw": {{json bodyExample}}
    }{{/if}},
    "description": "Required scope: {{scope}}"
  }
}
```

---

# 4) Postman helpers + partial registration

Create:
`src/core/generators/postman/hbsPostmanHelpers.ts`

```ts
import Handlebars from "handlebars";

export function registerPostmanHelpers() {
  Handlebars.registerHelper("concat", (a: any, b: any) => `${a}${b}`);

  Handlebars.registerHelper("json", (obj: any) => JSON.stringify(obj ?? {}, null, 2));

  Handlebars.registerHelper("postmanPathSegments", (path: string) => {
    // Convert "/notifications/settings/:id" into array segments for Postman
    // We’ll keep it as a single string segment to avoid too much complexity in v1.
    // Postman accepts raw anyway.
    return String(path || "").replace(/^\//, "");
  });

  Handlebars.registerHelper("opScope", (domainKey: string, method: string, scopesAll: string[]) => {
    if (Array.isArray(scopesAll) && scopesAll.length) {
      // v1: if multiple scopes exist, print first (Postman request description is free-form anyway)
      // You can also join them: scopesAll.join(", ")
      return scopesAll.join(", ");
    }
    const m = String(method || "").toUpperCase();
    return `${domainKey}:${m === "GET" ? "read" : "write"}`;
  });
}
```

> Note: Postman path structure can be more detailed; v1 keeps it simple and relies on `raw`.

---

# 5) Postman generator code

Create:
`src/core/generators/postman/index.ts`

```ts
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { renderTemplate } from "../../render/render";
import { writeFile, ensureDir } from "../../render/writers";
import { registerPostmanHelpers } from "./hbsPostmanHelpers";
import type { GenerationModel } from "../../planner/types";

function tpl(name: string) {
  return path.join(process.cwd(), "src/core/generators/postman/templates", name);
}

export function generatePostman(model: GenerationModel, spec: any) {
  registerPostmanHelpers();

  // Register partials
  const partialPath = tpl("_partials/requestItem.hbs");
  Handlebars.registerPartial("requestItem", fs.readFileSync(partialPath, "utf8"));

  // Build a simple view model for templates
  const domains = model.domains.map(d => {
    const specDomain = (spec.domains ?? []).find((x: any) => x.key === d.key);
    const label = specDomain?.label ?? d.className;

    const services = d.services.map(s => {
      const specService = specDomain?.services?.find((ss: any) => ss.key === s.key);
      const serviceLabel = specService?.label ?? s.className;

      // Minimal body examples (v1): take non-primary, non-timestamp fields
      const bodyExample = (entity: any) => {
        const ex: Record<string, any> = {};
        for (const f of entity.fields ?? []) {
          if (f.isPrimary || f.isCreatedAt || f.isUpdatedAt) continue;
          if (f.tsType === "boolean") ex[f.name] = true;
          else if (f.tsType === "number") ex[f.name] = 1;
          else if (f.tsType === "Date") ex[f.name] = new Date().toISOString();
          else ex[f.name] = `example_${f.name}`;
        }
        return ex;
      };

      const createEx = bodyExample(s.entity);
      const updateEx = bodyExample(s.entity);

      return {
        key: s.key,
        label: serviceLabel,
        route: s.route,
        hasCreate: s.crud.includes("create"),
        hasFindAll: s.crud.includes("findAll"),
        hasFindOne: s.crud.includes("findOne"),
        hasUpdate: s.crud.includes("update"),
        hasDelete: s.crud.includes("delete"),
        bodyExampleCreate: createEx,
        bodyExampleUpdate: updateEx,
        operations: (s.operations ?? []).map(op => ({
          ...op,
          bodyExample: op.requestDtoName ? { "TODO": op.requestDtoName } : {}
        }))
      };
    });

    return { key: d.key, label, services };
  });

  const content = renderTemplate(tpl("collection.json.hbs"), {
    projectName: model.projectName,
    domains
  });

  const outPath = path.join(model.outDir, "postman", "collection.json");
  ensureDir(path.dirname(outPath));
  writeFile(outPath, content);
}
```

---

# 6) Wire Postman generation into your `generate` command

In your `generateCmd` after code/docs/diagrams:

```ts
import { generatePostman } from "../../core/generators/postman";

// ...
generatePostman(model, spec);
```

And ensure your `deliverables.postman` toggles it:

```ts
if (spec.deliverables?.postman !== false) generatePostman(model, spec);
```

---

# 7) What the client gets (and why it sells)

Generated Postman collection includes:

* `Auth -> Get Token (Client Credentials)` helper
* Domain folders with description:

  * default scopes `notifications:read/write`
* Each request shows:

  * required scope in description
  * auth header already wired

This is the exact kind of “professional delivery” that makes clients trust the output.

---

# 8) Quick sanity test

After `archon generate`:

1. Open Postman
2. Import `output/postman/collection.json`
3. Set `baseUrl`
4. Set `token` manually (or configure tokenUrl/clientId/clientSecret/scope and run Auth request)
5. Run endpoints

