Locked: **domain-based scopes** like `notifications:read` / `notifications:write`.

Below is exactly what to change in your generator + templates so every generated controller gets the right `@Scopes()` decorators automatically.

---

## 1) Add scope naming rule (v1)

For each **domain**:

* Read endpoints (`findAll`, `findOne`, and `GET` operations) → `"<domainKey>:read"`
* Write endpoints (`create`, `update`, `delete`, and non-GET operations) → `"<domainKey>:write"`

Example:

* domain `notifications` → `notifications:read`, `notifications:write`

---

## 2) Add new auth files (templates)

Create these templates under `src/core/generators/code/nestjs/templates/`:

### `src/auth/scopes.decorator.ts.hbs`

```ts
import { SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'scopes';
export const Scopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);
```

### `src/auth/claims.ts.hbs`

```ts
export function normalizeStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') {
    return v.split(/[ ,]+/g).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export function extractScopes(payload: any): string[] {
  const candidates = [
    payload?.scope,                 // "a b c"
    payload?.scp,                   // ["a","b"] or "a b"
    payload?.permissions,           // ["a:b","c:d"]
    payload?.['https://example.com/scopes'],
    payload?.['https://example.com/permissions']
  ];
  const merged = candidates.flatMap(c => normalizeStringArray(c));
  return Array.from(new Set(merged));
}
```

### `src/auth/scopes.guard.ts.hbs`

```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from './scopes.decorator';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass()
    ]) || [];

    if (!requiredScopes.length) return true;

    const req = context.switchToHttp().getRequest();
    const scopes: string[] = req.user?.scopes || [];
    const ok = requiredScopes.every(s => scopes.includes(s));
    if (!ok) throw new ForbiddenException('Missing required scope');
    return true;
  }
}
```

---

## 3) Patch `jwt.guard.ts` template to attach scopes

In your existing `src/auth/jwt.guard.ts.hbs`:

### Add import:

```ts
import { extractScopes } from './claims';
```

### Extend user type and assignment:

```ts
type AuthUser = {
  sub?: string;
  email?: string;
  roles: string[];
  scopes: string[];
  raw: JWTPayload;
};
```

And in `canActivate()` where you set `req.user`:

```ts
const user: AuthUser = {
  sub: typeof payload.sub === 'string' ? payload.sub : undefined,
  email: typeof (payload as any).email === 'string' ? (payload as any).email : undefined,
  roles: normalizeRoles(payload),
  scopes: extractScopes(payload),
  raw: payload
};
req.user = user;
```

---

## 4) Update `auth.module.ts.hbs` to export ScopesGuard + decorator

Modify your `src/auth/auth.module.ts.hbs` providers/exports:

```ts
import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.guard';
import { ScopesGuard } from './scopes.guard';
{{#if rbacEnabled}}
import { RbacGuard } from './rbac.guard';
{{/if}}

@Module({
  providers: [
    Reflector,
    JwtAuthGuard,
    ScopesGuard{{#if rbacEnabled}}, RbacGuard{{/if}}
  ],
  exports: [
    JwtAuthGuard,
    ScopesGuard{{#if rbacEnabled}}, RbacGuard{{/if}}
  ]
})
export class AuthModule {}
```

---

## 5) Emit `@Scopes()` from controller templates (domain-based)

Update your `controller.crud.hbs` to import Scopes/ScopesGuard and apply per-method.

### In `templates/controller.crud.hbs`, add imports:

```hbs
{{#if useAuth}}
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { ScopesGuard } from '../../../auth/scopes.guard';
import { Scopes } from '../../../auth/scopes.decorator';
{{/if}}
```

### Then, before each CRUD handler, add scopes:

* For READ endpoints:

```hbs
  @UseGuards(JwtAuthGuard, ScopesGuard{{#if useRbac}}, RbacGuard{{/if}})
  @Scopes('{{domainKey}}:read')
```

* For WRITE endpoints:

```hbs
  @UseGuards(JwtAuthGuard, ScopesGuard{{#if useRbac}}, RbacGuard{{/if}})
  @Scopes('{{domainKey}}:write')
```

Concretely:

* `@Get()` + `@Get(':id')` → `{{domainKey}}:read`
* `@Post()`, `@Patch(':id')`, `@Delete(':id')` → `{{domainKey}}:write`

---

## 6) Pass `domainKey` into controller render call

In your generator (`genService(...)`), when rendering controller, pass `domainKey`:

```ts
renderToFile(
  tpl("controller.crud.hbs"),
  {
    domainKey: domain.key,   // <-- add this
    route: s.route,
    controllerClass: s.controllerClass,
    serviceClass: s.serviceClass,
    serviceKey: s.key,
    entityName: entity.name,
    entityFileBase,
    hasCreate: has("create"),
    hasFindAll: has("findAll"),
    hasFindOne: has("findOne"),
    hasUpdate: has("update"),
    hasDelete: has("delete"),
    useAuth: model.authMode === "jwt",
    useRbac: model.rbacEnabled
  },
  path.join(serviceDir, `${s.key}.controller.ts`)
);
```

---

## 7) Generate the new auth files during scaffolding

In `generateAppScaffold()` or in `generateNestJs()` when `authMode === "jwt"`:

Emit:

* `src/auth/scopes.decorator.ts`
* `src/auth/claims.ts`
* `src/auth/scopes.guard.ts`

Example:

```ts
renderToFile(tpl("src/auth/scopes.decorator.ts.hbs"), {}, path.join(outDir, "src/auth/scopes.decorator.ts"));
renderToFile(tpl("src/auth/claims.ts.hbs"), {}, path.join(outDir, "src/auth/claims.ts"));
renderToFile(tpl("src/auth/scopes.guard.ts.hbs"), {}, path.join(outDir, "src/auth/scopes.guard.ts"));
```

---

## 8) What the generated code will look like

For domain `notifications`:

```ts
@UseGuards(JwtAuthGuard, ScopesGuard, RbacGuard)
@Scopes('notifications:read')
@Get()
findAll() { ... }

@UseGuards(JwtAuthGuard, ScopesGuard, RbacGuard)
@Scopes('notifications:write')
@Post()
create(...) { ... }
```

