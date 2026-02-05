Done — here’s how to support **custom operation scopes** with:

1. **Automatic default** (GET ⇒ `domain:read`, non-GET ⇒ `domain:write`)
2. **Optional override per operation** (e.g. `notifications:toggle`) in **DesignSpec v1** without breaking existing specs.

---

# 1) Extend DesignSpec v1 (backward compatible)

Add an **optional** `scopesAll` (or `scopesAny`) under each operation’s `authz`.

### Patch to schema (`$defs.operation.properties.authz`)

In your DesignSpec schema, replace `$defs.authz` with a richer structure *or* add optional keys to existing `authz` object.

Simplest: **extend `$defs.authz`**:

```json
"authz": {
  "type": "object",
  "additionalProperties": false,
  "required": ["required", "rolesAny"],
  "properties": {
    "required": { "type": "boolean" },
    "rolesAny": {
      "type": "array",
      "items": { "type": "string", "pattern": "^[a-z][a-z0-9_]{1,30}$" },
      "default": []
    },
    "scopesAll": {
      "type": "array",
      "items": { "type": "string", "pattern": "^[a-z][a-z0-9-]{1,40}:(read|write|[a-z0-9-]{1,30})$" },
      "default": []
    }
  }
}
```

* If `scopesAll` is provided → generator uses it.
* If empty/missing → generator falls back to method-based default.

(You can later add `scopesAny` if you want OR semantics.)

---

# 2) Update planner model to carry scopes override

### `src/core/planner/types.ts` — update `OperationModel`

```ts
export type OperationModel = {
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  authRequired: boolean;
  rolesAny: string[];
  scopesAll?: string[];        // <-- add
  requestDtoName?: string;
  responseEntityName?: string;
};
```

### `src/core/planner/toGenerationModel.ts` — map it

Inside operations mapping:

```ts
operations: (s.operations ?? []).map((op: any) => ({
  name: op.name,
  method: op.method,
  path: op.path,
  authRequired: !!op.authz?.required,
  rolesAny: op.authz?.rolesAny ?? [],
  scopesAll: op.authz?.scopesAll ?? [],   // <-- add
  requestDtoName: op.request?.schemaRef?.startsWith("#/dtos/")
    ? op.request.schemaRef.replace("#/dtos/", "")
    : undefined,
  responseEntityName: op.response?.schemaRef?.startsWith("#/entities/")
    ? op.response.schemaRef.replace("#/entities/", "")
    : undefined
}))
```

---

# 3) Add helper: default scope per method

### `src/core/render/hbsHelpers.ts` — add helper

```ts
Handlebars.registerHelper("defaultScopeForMethod", (domainKey: string, method: string) => {
  const m = String(method || "").toUpperCase();
  const rw = m === "GET" ? "read" : "write";
  return `${domainKey}:${rw}`;
});
```

---

# 4) Update ops controller template to emit @Scopes()

You said earlier you may append ops into CRUD controller. Easiest: keep `controller.ops.hbs` as an add-on and append it (or merge into same template later).

### `templates/controller.ops.hbs` — update to include scope logic

```hbs
{{#each operations}}

{{#if authRequired}}
  @UseGuards(JwtAuthGuard, ScopesGuard{{#if ../useRbac}}, RbacGuard{{/if}})
{{/if}}

{{#if scopesAll.length}}
  @Scopes({{#each scopesAll}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}})
{{else}}
  @Scopes('{{defaultScopeForMethod ../domainKey method}}')
{{/if}}

{{#if rolesAny.length}}
  @Roles({{#each rolesAny}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}})
{{/if}}
  @{{nestjsMethod method}}(':id{{pathSuffix path}}')
  {{name}}(
    @Param('id') id: string{{#if requestDtoName}},
    @Body() dto: {{requestDtoName}}{{/if}}
  ) {
    return this.service.{{name}}(id{{#if requestDtoName}}, dto{{/if}});
  }

{{/each}}
```

This logic does:

* If `authRequired`: applies guards
* If `authz.scopesAll` exists: uses those scopes
* Else: default `domainKey:read` for GET, `domainKey:write` otherwise
* Applies roles if present

---

# 5) Ensure ops template has required imports

Your CRUD controller already imports:

* `JwtAuthGuard`
* `ScopesGuard`
* `Scopes`
* (RBAC optional)

Make sure `controller.crud.hbs` includes those imports (you already did earlier).

---

# 6) Append ops methods into the generated controller (v1)

Right now your generator renders `controller.crud.hbs` only. Add a simple “append ops” step.

### `src/core/generators/code/nestjs/index.ts` — after rendering CRUD controller

Add:

```ts
import fs from "fs";
import { renderTemplate } from "../../../render/render"; // add export if you don’t have it

// ...after rendering controller.crud.hbs
if (s.operations?.length) {
  const opsBlock = renderTemplate(
    tpl("controller.ops.hbs"),
    {
      domainKey: domain.key,
      useRbac: model.rbacEnabled,
      operations: s.operations
    }
  );

  const controllerPath = path.join(serviceDir, `${s.key}.controller.ts`);
  const current = fs.readFileSync(controllerPath, "utf8");

  // naive insertion: append before final closing brace of controller class
  const updated = current.replace(/\n}\s*$/m, `\n${opsBlock}\n}\n`);
  fs.writeFileSync(controllerPath, updated, "utf8");
}
```

If you don’t currently export `renderTemplate`, do it in `src/core/render/render.ts`:

```ts
export function renderTemplate(templatePath: string, data: any) { ... }
```

---

# 7) Example DesignSpec operation with override scopes

```json
{
  "name": "toggleEnabled",
  "method": "PATCH",
  "path": "/:id/toggle",
  "authz": {
    "required": true,
    "rolesAny": ["admin"],
    "scopesAll": ["notifications:toggle"]
  },
  "request": { "contentType": "application/json", "schemaRef": "#/dtos/ToggleEnabledDto" },
  "response": { "contentType": "application/json", "schemaRef": "#/entities/NotificationSetting" }
}
```

If you omit `scopesAll`, it becomes `notifications:write` automatically (because PATCH).

---

# 8) Optional (recommended): scopes in CRUD controller too

You already applied:

* read methods → `{{domainKey}}:read`
* write methods → `{{domainKey}}:write`

So now **CRUD + operations** are consistent.

