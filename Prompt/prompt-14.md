Alright — we’ll generate **OpenAPI (Swagger) with scope requirements** so the output repo is “enterprise believable” immediately.

We’ll do it the clean NestJS way:

* Use `@nestjs/swagger` to emit OpenAPI JSON
* Document security as **OAuth2 scopes** (even if you validate JWT locally) because OpenAPI is the standard place where “scopes” live
* Auto-apply `@ApiOAuth2(['notifications:read'])` / `@ApiOAuth2(['notifications:write'])` per endpoint using your same domain-based rule + operation overrides

---

# 1) Add Swagger dependencies (package.json.hbs)

Add:

```json
"dependencies": {
  ...
  "@nestjs/swagger": "^7.3.0",
  "swagger-ui-express": "^5.0.0"
}
```

---

# 2) Swagger setup in `main.ts` (template update)

Update `src/main.ts.hbs` to configure Swagger and expose `/docs` + `/openapi.json`.

### `src/main.ts.hbs` (replace with this version)

```ts
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  // Swagger / OpenAPI
  const swagger = new DocumentBuilder()
    .setTitle(process.env.APP_NAME || '{{projectName}}')
    .setDescription('Generated from DesignSpec v1')
    .setVersion('0.1.0')
    // Bearer auth for JWT
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer'
    )
    // OAuth2 scopes for documentation (domain-based scopes)
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: process.env.OAUTH_AUTH_URL || 'https://example.com/oauth/authorize',
            tokenUrl: process.env.OAUTH_TOKEN_URL || 'https://example.com/oauth/token',
            scopes: JSON.parse(process.env.OAUTH_SCOPES_JSON || '{"notifications:read":"Read notifications","notifications:write":"Write notifications"}')
          }
        }
      },
      'oauth2'
    )
    .build();

  const doc = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('/docs', app, doc);

  // raw OpenAPI
  app.use('/openapi.json', (_req, res) => res.json(doc));

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI on http://localhost:${port}/docs`);
}

bootstrap();
```

> Note: the OAuth URLs are just placeholders. In real client projects they plug their IdP (Auth0/Azure/Keycloak). Your runtime auth enforcement remains your JWT + ScopesGuard.

---

# 3) Add env variables to `.env.example.hbs`

Append:

```hbs
# Swagger OAuth2 documentation (optional)
OAUTH_AUTH_URL=https://example.com/oauth/authorize
OAUTH_TOKEN_URL=https://example.com/oauth/token

# OpenAPI scopes registry (JSON object)
OAUTH_SCOPES_JSON={"notifications:read":"Read notifications","notifications:write":"Write notifications"}
```

Later you can generate `OAUTH_SCOPES_JSON` automatically from domains.

---

# 4) Controller template: add Swagger decorators with scopes

## 4A) Update `controller.crud.hbs`

Add imports at top:

```hbs
import { ApiBearerAuth, ApiOAuth2, ApiOperation, ApiTags } from '@nestjs/swagger';
```

Then decorate the controller:

```hbs
@ApiTags('{{domainKey}}')
{{#if useAuth}}
@ApiBearerAuth('bearer')
{{/if}}
@Controller('{{route}}')
export class {{controllerClass}} {
```

Now per method, add `@ApiOperation` + `@ApiOAuth2([scope])`.

### Example snippets to inject into the CRUD handlers

For READ endpoints:

```hbs
  @ApiOperation({ summary: 'List resources' })
  @ApiOAuth2(['{{domainKey}}:read'], 'oauth2')
```

For WRITE endpoints:

```hbs
  @ApiOperation({ summary: 'Create resource' })
  @ApiOAuth2(['{{domainKey}}:write'], 'oauth2')
```

Concretely:

* `@Post()` → write
* `@Get()` + `@Get(':id')` → read
* `@Patch(':id')` + `@Delete(':id')` → write

This makes Swagger explicitly show required scopes.

---

## 4B) Update `controller.ops.hbs` to document operation scopes

Add these inside each operation block:

```hbs
  @ApiOperation({ summary: 'Operation: {{name}}' })
  {{#if scopesAll.length}}
  @ApiOAuth2([{{#each scopesAll}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}], 'oauth2')
  {{else}}
  @ApiOAuth2(['{{defaultScopeForMethod ../domainKey method}}'], 'oauth2')
  {{/if}}
```

That matches your runtime ScopesGuard logic exactly.

---

# 5) Generator: pass `projectName` into main.ts template

In `generateAppScaffold()` when rendering `src/main.ts.hbs`, pass:

```ts
renderToFile(
  tpl("src/main.ts.hbs"),
  { projectName: model.projectName },
  path.join(model.outDir, "src/main.ts")
);
```

---

# 6) Optional: auto-generate OAUTH_SCOPES_JSON from domains (recommended)

In your app scaffold generator, compute the scope registry:

```ts
const scopes: Record<string, string> = {};
for (const d of model.domains) {
  scopes[`${d.key}:read`] = `Read ${d.key}`;
  scopes[`${d.key}:write`] = `Write ${d.key}`;
}
// plus operation overrides (if present)
for (const d of model.domains) {
  for (const s of d.services) {
    for (const op of s.operations) {
      for (const sc of op.scopesAll ?? []) {
        scopes[sc] = `Scope ${sc}`;
      }
    }
  }
}
```

Then render `.env.example`:

```ts
OAUTH_SCOPES_JSON=${JSON.stringify(scopes)}
```

That way Swagger always lists every scope your API uses.

---

# 7) Result: what the generated OpenAPI will show

In Swagger UI:

* Endpoints have **Security** section listing `oauth2` with scopes:

  * `notifications:read`
  * `notifications:write`
  * plus any overrides like `notifications:toggle`

So the client sees exactly what token must contain.

---

# 8) Final note: enforcement vs documentation

* **Enforcement**: your `JwtAuthGuard + ScopesGuard` (runtime)
* **Documentation**: `@ApiOAuth2([...])` (OpenAPI)

This is the right separation and looks professional.

