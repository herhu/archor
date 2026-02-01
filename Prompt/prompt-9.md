Below is the **minimal app scaffolding v1** you need so the generated repo is **runnable** (`npm i && npm run build && npm run start:dev`) and works with **NestJS + TypeORM + Postgres** using `DATABASE_URL`.

This set plugs into your existing generator exactly like the other templates.

---

# 1) Templates to add

Create these under:

`src/core/generators/code/nestjs/templates/`

## 1A) `package.json.hbs`

```hbs
{
  "name": "{{kebabProjectName}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node dist/main.js",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "lint": "eslint \"src/**/*.ts\" --max-warnings=0",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.20",
    "pg": "^8.11.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.4.0"
  }
}
```

---

## 1B) `tsconfig.json.hbs`

```hbs
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

---

## 1C) `.eslintrc.cjs.hbs`

```hbs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, jest: true, es2021: true },
  ignorePatterns: ['dist/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
```

---

## 1D) `jest.config.js.hbs`

```hbs
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node'
};
```

---

## 1E) `src/main.ts.hbs`

```hbs
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${port}`);
}

bootstrap();
```

---

## 1F) `src/app.module.ts.hbs`

This imports Config + TypeORM + your generated domain modules + auth guards stubs.

```hbs
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

{{#if authEnabled}}
import { AuthModule } from './auth/auth.module';
{{/if}}

{{#each domains}}
import { {{moduleClass}} } from './modules/{{key}}/{{key}}.module';
{{/each}}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true
    }),

    {{#if authEnabled}}AuthModule,{{/if}}

    {{#each domains}}{{moduleClass}}{{#unless @last}}, {{/unless}}{{/each}}
  ]
})
export class AppModule {}
```

> v1 uses `synchronize: true` to make onboarding instant. In v2 you flip to migrations.

---

## 1G) `src/auth/auth.module.ts.hbs`

```hbs
import { Module } from '@nestjs/common';
{{#if rbacEnabled}}
import { Reflector } from '@nestjs/core';
{{/if}}
import { JwtAuthGuard } from './jwt.guard';
{{#if rbacEnabled}}
import { RbacGuard } from './rbac.guard';
{{/if}}

@Module({
  providers: [
    JwtAuthGuard{{#if rbacEnabled}}, RbacGuard, Reflector{{/if}}
  ],
  exports: [
    JwtAuthGuard{{#if rbacEnabled}}, RbacGuard{{/if}}
  ]
})
export class AuthModule {}
```

---

## 1H) `.env.example.hbs`

```hbs
# Server
PORT=3000

# Postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/{{kebabProjectName}}

# JWT (v1 stub guard reads only Authorization header format)
JWT_ISSUER={{jwtIssuer}}
JWT_AUDIENCE={{jwtAudience}}
```

---

## 1I) `README.md.hbs`

````hbs
# {{projectName}}

Generated backend scaffold from **DesignSpec v1**.

## Quick start

1) Copy env:
```bash
cp .env.example .env
````

2. Start Postgres:

```bash
docker compose up -d
```

3. Install & run:

```bash
npm install
npm run start:dev
```

## What’s included

* NestJS + TypeORM + Postgres
* Modules, controllers, services, repositories generated from spec
  {{#if authEnabled}}- JWT auth guard stub (v1){{/if}}
  {{#if rbacEnabled}}- RBAC guard + @Roles decorator{{/if}}

## Generated docs

* `docs/architecture.md`
* `docs/api.md`
* `docs/decisions.md`

## Generated diagrams (Mermaid)

* `diagrams/components.mmd`
* `diagrams/domain-*.mmd`
* `diagrams/sequence-*.mmd`

````

---

## 1J) `docker-compose.yml.hbs`

```hbs
services:
  db:
    image: postgres:16
    container_name: {{kebabProjectName}}_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: {{kebabProjectName}}
    ports:
      - "5432:5432"
    volumes:
      - {{kebabProjectName}}_pg:/var/lib/postgresql/data

volumes:
  {{kebabProjectName}}_pg:
````

---

## 1K) `Dockerfile.hbs` (optional but useful)

```hbs
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

# 2) Wire scaffolding into your NestJS generator

Update `src/core/generators/code/nestjs/index.ts`:

### Add at top-level (before domains)

```ts
import { renderToFile } from "../../../render/render";
import { kebabCase } from "../../../planner/naming";

function tpl(name: string) {
  return path.join(process.cwd(), "src/core/generators/code/nestjs/templates", name);
}
```

### Add a new function:

```ts
function generateAppScaffold(model: GenerationModel, spec: any) {
  const kebabProjectName = kebabCase(model.projectName);

  renderToFile(tpl("package.json.hbs"), { kebabProjectName }, path.join(model.outDir, "package.json"));
  renderToFile(tpl("tsconfig.json.hbs"), {}, path.join(model.outDir, "tsconfig.json"));
  renderToFile(tpl(".eslintrc.cjs.hbs"), {}, path.join(model.outDir, ".eslintrc.cjs"));
  renderToFile(tpl("jest.config.js.hbs"), {}, path.join(model.outDir, "jest.config.js"));

  renderToFile(tpl("src/main.ts.hbs"), {}, path.join(model.outDir, "src/main.ts"));
  renderToFile(
    tpl("src/app.module.ts.hbs"),
    {
      domains: model.domains.map(d => ({ key: d.key, moduleClass: d.moduleClass })),
      authEnabled: model.authMode === "jwt"
    },
    path.join(model.outDir, "src/app.module.ts")
  );

  if (model.authMode === "jwt") {
    renderToFile(tpl("src/auth/auth.module.ts.hbs"), { rbacEnabled: model.rbacEnabled }, path.join(model.outDir, "src/auth/auth.module.ts"));
  }

  renderToFile(
    tpl(".env.example.hbs"),
    {
      kebabProjectName,
      jwtIssuer: spec.crossCutting?.auth?.jwt?.issuer ?? "https://issuer.example",
      jwtAudience: spec.crossCutting?.auth?.jwt?.audience ?? "app"
    },
    path.join(model.outDir, ".env.example")
  );

  renderToFile(tpl("README.md.hbs"), { projectName: model.projectName, authEnabled: model.authMode === "jwt", rbacEnabled: model.rbacEnabled }, path.join(model.outDir, "README.md"));
  renderToFile(tpl("docker-compose.yml.hbs"), { kebabProjectName }, path.join(model.outDir, "docker-compose.yml"));
  renderToFile(tpl("Dockerfile.hbs"), {}, path.join(model.outDir, "Dockerfile"));
}
```

### Call it inside `generateNestJs(model)`:

```ts
export function generateNestJs(model: GenerationModel, spec?: any) {
  generateAppScaffold(model, spec);

  for (const domain of model.domains) {
    genDomain(domain, model);
  }

  // existing auth stubs (jwt.guard / roles / rbac) remain as you already have
}
```

And update your call site:

```ts
generateNestJs(model, spec);
```

---

# 3) One tiny fix you should do now (important)

Your `domain.module.hbs` currently imports TypeOrmModule and entities — good.

But you must ensure the domain folder exists even if no entities/services: your writer already makes directories; fine.

---

# 4) What you can run end-to-end now

Once you generate to `output/`:

```bash
cd output
cp .env.example .env
docker compose up -d
npm install
npm run build
npm run start:dev
```

You now have a **runnable generated backend** + docs + diagrams.

