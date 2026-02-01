Great — we’ll generate a **Postman Environment v1** alongside the collection, so clients import **2 files** and run immediately.

You’ll output:

* `postman/collection.json`
* `postman/environment.json`

---

# 1) Environment template

Create:

`src/core/generators/postman/templates/environment.json.hbs`

```hbs
{
  "id": "{{envId}}",
  "name": "{{projectName}} (Local)",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "default",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "type": "secret",
      "enabled": true
    },
    {
      "key": "tokenUrl",
      "value": "",
      "type": "default",
      "enabled": true
    },
    {
      "key": "clientId",
      "value": "",
      "type": "default",
      "enabled": true
    },
    {
      "key": "clientSecret",
      "value": "",
      "type": "secret",
      "enabled": true
    },
    {
      "key": "scope",
      "value": "{{defaultScope}}",
      "type": "default",
      "enabled": true
    }
  ],
  "_postman_variable_scope": "environment",
  "_postman_exported_at": "{{exportedAt}}",
  "_postman_exported_using": "archon-generator"
}
```

**Notes:**

* `token` and `clientSecret` are marked `secret`
* `scope` defaults to a reasonable string (see generator logic)

---

# 2) Environment generator code

Update:

`src/core/generators/postman/index.ts`

Add below `generatePostman(...)` or inside it:

```ts
import crypto from "crypto";

function isoNow() {
  return new Date().toISOString();
}

function defaultScopeString(model: GenerationModel) {
  // v1 default: include all domain read scopes (safe)
  // Client can change to write scopes as needed.
  return model.domains.map(d => `${d.key}:read`).join(" ");
}

export function generatePostmanEnvironment(model: GenerationModel) {
  const envId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

  const content = renderTemplate(tpl("environment.json.hbs"), {
    envId,
    projectName: model.projectName,
    exportedAt: isoNow(),
    defaultScope: defaultScopeString(model)
  });

  const outPath = path.join(model.outDir, "postman", "environment.json");
  ensureDir(path.dirname(outPath));
  writeFile(outPath, content);
}
```

Then export it:

```ts
export { generatePostmanEnvironment };
```

---

# 3) Wire it into `generateCmd`

In your `generateCmd`:

```ts
import { generatePostman, generatePostmanEnvironment } from "../../core/generators/postman";

// ...
if (spec.deliverables?.postman !== false) {
  generatePostman(model, spec);
  generatePostmanEnvironment(model);
}
```

---

# 4) One small improvement: use *environment* variables in the collection

Right now your collection uses `{{baseUrl}}` and `{{token}}`. In Postman, both collection vars and environment vars can resolve.

But for clarity, you can remove collection vars entirely and rely only on environment vars. Not required in v1.

If you want that tweak:

* remove `"variable": [...]` from collection template
* keep only environment.json

---

# 5) Client instructions (auto-add to README)

Add to `README.md.hbs`:

```hbs
## Postman
Import:
- `postman/collection.json`
- `postman/environment.json`

Select the environment in Postman, set:
- `baseUrl`
- `token` (or configure tokenUrl/clientId/clientSecret/scope and run Auth -> Get Token)
```

---

# 6) Deliverable output (Phase 1 looks premium)

```text
postman/
  collection.json
  environment.json
docs/
diagrams/
src/
docker-compose.yml
.env.example
README.md
```

This is the “client trust package”.

