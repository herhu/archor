Below is a **drop-in v1 template pack + helpers** for the minimal set you need to generate a working NestJS + TypeORM CRUD module from `DesignSpec v1`.

I’ll assume:

* Templates: **Handlebars** (`handlebars` npm)
* CLI runner: Node/TS (but you can run in plain JS)
* Output structure: `output/src/...` as in the plan

You can copy-paste these files as-is.

---

# 0) Naming + path helpers

### `src/core/planner/naming.ts`

```ts
export function kebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function pascalCase(input: string): string {
  const s = input
    .replace(/[-_]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  // If input already looks PascalCase, keep stable
  return s.length ? s : input;
}

export function camelCase(input: string): string {
  const p = pascalCase(input);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

export function pluralizeKebab(kebab: string): string {
  // intentionally dumb v1 (good enough for B2B PoC)
  // later: add proper pluralization library.
  if (kebab.endsWith("s")) return kebab;
  return `${kebab}s`;
}
```

### `src/core/planner/types.ts`

```ts
export type TsType = "string" | "number" | "boolean" | "Date" | "any";

export type FieldModel = {
  name: string;
  tsType: TsType;
  required: boolean;
  unique: boolean;
  maxLength?: number;
  isPrimary: boolean;
  isCreatedAt?: boolean;
  isUpdatedAt?: boolean;
};

export type EntityModel = {
  name: string;       // PascalCase
  table: string;      // snake_case
  primaryKey: string;
  fileName: string;   // kebab-case.entity.ts
  fields: FieldModel[];
};

export type OperationModel = {
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string; // "/:id/toggle"
  authRequired: boolean;
  rolesAny: string[];
  requestDtoName?: string;   // e.g., ToggleEnabledDto
  responseEntityName?: string; // e.g., NotificationSetting
};

export type ServiceModel = {
  key: string;          // kebab
  className: string;    // PascalCase, e.g. NotificationSettings
  route: string;        // "/notifications/settings"
  controllerClass: string;
  serviceClass: string;
  repoClass: string;
  controllerFile: string;
  serviceFile: string;
  repoFile: string;
  crud: Array<"create" | "findAll" | "findOne" | "update" | "delete">;
  operations: OperationModel[];
  // v1 assumes one “primary entity” per service for CRUD. Expand later.
  entity: EntityModel;
};

export type DomainModel = {
  key: string;          // kebab
  className: string;    // PascalCase
  baseRoute: string;    // "/notifications"
  moduleFile: string;   // notifications.module.ts
  moduleClass: string;  // NotificationsModule
  modulePath: string;   // src/modules/notifications
  entities: EntityModel[];
  services: ServiceModel[];
};

export type GenerationModel = {
  projectName: string;
  outDir: string;
  orm: "typeorm";
  domains: DomainModel[];
  authMode: "none" | "jwt";
  rbacEnabled: boolean;
  roles: string[];
  envVars: Array<{ key: string; required: boolean; description: string; example?: string }>;
  errorMap: Array<{ code: string; httpStatus: number; message: string }>;
};
```

### `src/core/planner/toGenerationModel.ts`

```ts
import { camelCase, kebabCase, pascalCase } from "./naming";
import type { GenerationModel, DomainModel, EntityModel, FieldModel, ServiceModel } from "./types";

function mapFieldType(t: string) {
  switch (t) {
    case "uuid":
    case "string":
    case "text":
      return "string" as const;
    case "int":
    case "float":
      return "number" as const;
    case "boolean":
      return "boolean" as const;
    case "timestamp":
      return "Date" as const;
    case "json":
      return "any" as const;
    default:
      return "any" as const;
  }
}

export function toGenerationModel(spec: any, outDir: string): GenerationModel {
  const authMode = spec?.crossCutting?.auth?.mode ?? "none";
  const rbacEnabled = !!spec?.crossCutting?.auth?.rbac?.enabled;
  const roles = spec?.crossCutting?.auth?.rbac?.roles ?? [];

  const domains: DomainModel[] = (spec.domains ?? []).map((d: any) => {
    const domainKey = d.key;
    const domainClass = pascalCase(domainKey);
    const moduleClass = `${domainClass}Module`;
    const modulePath = `src/modules/${domainKey}`;

    const entities: EntityModel[] = (d.entities ?? []).map((e: any) => {
      const entityName = e.name;
      const entityFileBase = kebabCase(entityName);
      const fields: FieldModel[] = (e.fields ?? []).map((f: any) => {
        const isCreatedAt = f.name === "createdAt";
        const isUpdatedAt = f.name === "updatedAt";
        return {
          name: f.name,
          tsType: mapFieldType(f.type),
          required: !!f.required,
          unique: !!f.unique,
          maxLength: f.maxLength,
          isPrimary: f.name === e.primaryKey,
          isCreatedAt,
          isUpdatedAt
        };
      });

      return {
        name: entityName,
        table: e.table,
        primaryKey: e.primaryKey,
        fileName: `${entityFileBase}.entity.ts`,
        fields
      };
    });

    // v1: bind each service to first entity unless future mapping added
    const defaultEntity = entities[0];

    const services: ServiceModel[] = (d.services ?? []).map((s: any) => {
      const serviceKey = s.key; // kebab
      const serviceClassBase = pascalCase(serviceKey);
      const className = serviceClassBase; // keep stable
      const controllerClass = `${className}Controller`;
      const serviceClass = `${className}Service`;
      const repoClass = `${className}Repository`;

      const serviceDir = `${modulePath}/${serviceKey}`;

      return {
        key: serviceKey,
        className,
        route: s.route,
        controllerClass,
        serviceClass,
        repoClass,
        controllerFile: `${serviceKey}.controller.ts`,
        serviceFile: `${serviceKey}.service.ts`,
        repoFile: `${serviceKey}.repository.ts`,
        crud: s.crud ?? [],
        operations: (s.operations ?? []).map((op: any) => ({
          name: op.name,
          method: op.method,
          path: op.path,
          authRequired: !!op.authz?.required,
          rolesAny: op.authz?.rolesAny ?? [],
          requestDtoName: op.request?.schemaRef?.startsWith("#/dtos/")
            ? op.request.schemaRef.replace("#/dtos/", "")
            : undefined,
          responseEntityName: op.response?.schemaRef?.startsWith("#/entities/")
            ? op.response.schemaRef.replace("#/entities/", "")
            : undefined
        })),
        entity: defaultEntity
      };
    });

    return {
      key: domainKey,
      className: domainClass,
      baseRoute: d.baseRoute,
      moduleFile: `${domainKey}.module.ts`,
      moduleClass,
      modulePath,
      entities,
      services
    };
  });

  return {
    projectName: spec.project?.name ?? "GeneratedApp",
    outDir,
    orm: "typeorm",
    domains,
    authMode,
    rbacEnabled,
    roles,
    envVars: spec.crossCutting?.config?.envVars ?? [],
    errorMap: spec.crossCutting?.errors?.map ?? []
  };
}
```

---

# 1) Core templates (Handlebars)

## 1A) TypeORM entity template

### `templates/entity.typeorm.hbs`

```hbs
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

{{#each indexes}}
@Index([{{#each fields}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}], { unique: {{unique}} })
{{/each}}
@Entity({ name: '{{table}}' })
export class {{name}} {
{{#each fields}}
{{#if isPrimary}}
  @PrimaryGeneratedColumn('uuid')
  {{name}}: string;
{{else if isCreatedAt}}
  @CreateDateColumn({ type: 'timestamptz' })
  {{name}}: Date;
{{else if isUpdatedAt}}
  @UpdateDateColumn({ type: 'timestamptz' })
  {{name}}: Date;
{{else}}
  @Column({
    type: '{{typeormColumnType tsType}}'{{#if maxLength}},
    length: {{maxLength}}{{/if}}{{#if unique}},
    unique: true{{/if}}{{#unless required}},
    nullable: true{{/unless}}
  })
  {{name}}{{#unless required}}?{{/unless}}: {{tsType}};
{{/if}}

{{/each}}
}
```

**Note:** We referenced `typeormColumnType` helper; add it below.

---

## 1B) Create DTO template

### `templates/dto.create.hbs`

```hbs
import { IsBoolean, IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';

export class Create{{entityName}}Dto {
{{#each fields}}
{{#unless isPrimary}}
{{#unless isCreatedAt}}
{{#unless isUpdatedAt}}
  {{#if required}}
  {{dtoDecorator this}}
  {{name}}: {{tsType}};
  {{else}}
  @IsOptional()
  {{dtoDecorator this}}
  {{name}}?: {{tsType}};
  {{/if}}

{{/unless}}
{{/unless}}
{{/unless}}
{{/each}}
}
```

---

## 1C) Update DTO template

### `templates/dto.update.hbs`

```hbs
import { PartialType } from '@nestjs/mapped-types';
import { Create{{entityName}}Dto } from './create-{{entityFileBase}}.dto';

export class Update{{entityName}}Dto extends PartialType(Create{{entityName}}Dto) {}
```

---

## 1D) Repository template (simple wrapper)

### `templates/repository.hbs`

```hbs
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {{entityName}} } from '../entities/{{entityFileBase}}.entity';

@Injectable()
export class {{repoClass}} {
  constructor(
    @InjectRepository({{entityName}})
    private readonly repo: Repository<{{entityName}}>
  ) {}

  create(data: Partial<{{entityName}}>) {
    return this.repo.save(this.repo.create(data));
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } as any });
  }

  async update(id: string, data: Partial<{{entityName}}>) {
    await this.repo.update({ id } as any, data);
    return this.findOne(id);
  }

  async delete(id: string) {
    const existing = await this.findOne(id);
    if (!existing) return null;
    await this.repo.delete({ id } as any);
    return existing;
  }
}
```

---

## 1E) Service template (CRUD + error mapping placeholders)

### `templates/service.hbs`

```hbs
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { {{repoClass}} } from './{{serviceKey}}.repository';
import { Create{{entityName}}Dto } from '../dtos/create-{{entityFileBase}}.dto';
import { Update{{entityName}}Dto } from '../dtos/update-{{entityFileBase}}.dto';

@Injectable()
export class {{serviceClass}} {
  constructor(private readonly repo: {{repoClass}}) {}

{{#if hasCreate}}
  async create(dto: Create{{entityName}}Dto) {
    try {
      return await this.repo.create(dto as any);
    } catch (e: any) {
      // v1: naive conflict mapping; upgrade later with DB error parsing
      throw new ConflictException('Resource already exists');
    }
  }
{{/if}}

{{#if hasFindAll}}
  findAll() {
    return this.repo.findAll();
  }
{{/if}}

{{#if hasFindOne}}
  async findOne(id: string) {
    const found = await this.repo.findOne(id);
    if (!found) throw new NotFoundException('Not found');
    return found;
  }
{{/if}}

{{#if hasUpdate}}
  async update(id: string, dto: Update{{entityName}}Dto) {
    const updated = await this.repo.update(id, dto as any);
    if (!updated) throw new NotFoundException('Not found');
    return updated;
  }
{{/if}}

{{#if hasDelete}}
  async remove(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundException('Not found');
    return deleted;
  }
{{/if}}

{{#each operations}}
  async {{name}}(id: string{{#if requestDtoName}}, dto: {{requestDtoName}}{{/if}}) {
    // v1: stub. In v1 deliverable, it’s fine to produce TODO blocks.
    // You can optionally implement common toggles automatically later.
    return this.findOne(id);
  }
{{/each}}
}
```

---

## 1F) Controller templates

### CRUD controller: `templates/controller.crud.hbs`

```hbs
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { {{serviceClass}} } from './{{serviceKey}}.service';
import { Create{{entityName}}Dto } from '../dtos/create-{{entityFileBase}}.dto';
import { Update{{entityName}}Dto } from '../dtos/update-{{entityFileBase}}.dto';
{{#if useAuth}}
import { JwtAuthGuard } from '../../../auth/jwt.guard';
{{/if}}
{{#if useRbac}}
import { RbacGuard } from '../../../auth/rbac.guard';
import { Roles } from '../../../auth/roles.decorator';
{{/if}}

@Controller('{{route}}')
export class {{controllerClass}} {
  constructor(private readonly service: {{serviceClass}}) {}

{{#if useAuth}}
  @UseGuards(JwtAuthGuard{{#if useRbac}}, RbacGuard{{/if}})
{{/if}}
{{#if hasCreate}}
  @Post()
  {{#if useRbac}}@Roles('admin'){{/if}}
  create(@Body() dto: Create{{entityName}}Dto) {
    return this.service.create(dto);
  }
{{/if}}

{{#if useAuth}}
  @UseGuards(JwtAuthGuard{{#if useRbac}}, RbacGuard{{/if}})
{{/if}}
{{#if hasFindAll}}
  @Get()
  {{#if useRbac}}@Roles('admin'){{/if}}
  findAll() {
    return this.service.findAll();
  }
{{/if}}

{{#if useAuth}}
  @UseGuards(JwtAuthGuard{{#if useRbac}}, RbacGuard{{/if}})
{{/if}}
{{#if hasFindOne}}
  @Get(':id')
  {{#if useRbac}}@Roles('admin'){{/if}}
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
{{/if}}

{{#if useAuth}}
  @UseGuards(JwtAuthGuard{{#if useRbac}}, RbacGuard{{/if}})
{{/if}}
{{#if hasUpdate}}
  @Patch(':id')
  {{#if useRbac}}@Roles('admin'){{/if}}
  update(@Param('id') id: string, @Body() dto: Update{{entityName}}Dto) {
    return this.service.update(id, dto);
  }
{{/if}}

{{#if useAuth}}
  @UseGuards(JwtAuthGuard{{#if useRbac}}, RbacGuard{{/if}})
{{/if}}
{{#if hasDelete}}
  @Delete(':id')
  {{#if useRbac}}@Roles('admin'){{/if}}
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
{{/if}}
}
```

### Operations controller add-on: `templates/controller.ops.hbs`

```hbs
{{!-- Optional: you can merge ops into the CRUD controller in v1.
    If you want ops in same file, append these methods to the controller. --}}

{{#each operations}}

{{#if authRequired}}
  @UseGuards(JwtAuthGuard{{#if ../useRbac}}, RbacGuard{{/if}})
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

---

## 1G) Domain module template

### `templates/domain.module.hbs`

```hbs
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

{{#each entities}}
import { {{name}} } from './entities/{{entityFileBase}}.entity';
{{/each}}

{{#each services}}
import { {{controllerClass}} } from './{{key}}/{{key}}.controller';
import { {{serviceClass}} } from './{{key}}/{{key}}.service';
import { {{repoClass}} } from './{{key}}/{{key}}.repository';
{{/each}}

@Module({
  imports: [
    TypeOrmModule.forFeature([
      {{#each entities}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}
    ])
  ],
  controllers: [
    {{#each services}}{{controllerClass}}{{#unless @last}}, {{/unless}}{{/each}}
  ],
  providers: [
    {{#each services}}{{serviceClass}}, {{repoClass}}{{#unless @last}}, {{/unless}}{{/each}}
  ],
  exports: []
})
export class {{moduleClass}} {}
```

---

## 1H) Auth templates (JWT + RBAC)

### `templates/auth.guard.hbs` (`src/auth/jwt.guard.ts`)

```hbs
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // v1: stub validation. Replace with real JWT verification later.
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    if (!auth || !String(auth).startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    // attach minimal user for RBAC demo
    req.user = req.user || { roles: ['admin'] };
    return true;
  }
}
```

### `templates/roles.decorator.hbs` (`src/auth/roles.decorator.ts`)

```hbs
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### `templates/rbac.guard.hbs` (`src/auth/rbac.guard.ts`)

```hbs
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]) || [];

    if (!requiredRoles.length) return true;

    const req = context.switchToHttp().getRequest();
    const roles: string[] = req.user?.roles || [];
    const ok = requiredRoles.some(r => roles.includes(r));
    if (!ok) throw new ForbiddenException('Forbidden');
    return true;
  }
}
```

---

# 2) Handlebars helpers you need

### `src/core/render/hbsHelpers.ts`

```ts
import Handlebars from "handlebars";

export function registerHelpers() {
  Handlebars.registerHelper("typeormColumnType", (tsType: string) => {
    switch (tsType) {
      case "string": return "varchar";
      case "number": return "int";
      case "boolean": return "boolean";
      case "Date": return "timestamptz";
      default: return "jsonb";
    }
  });

  Handlebars.registerHelper("dtoDecorator", (field: any) => {
    // minimal v1: map basic validation
    if (field.tsType === "boolean") return "@IsBoolean()";
    if (field.name.toLowerCase().includes("url")) return "@IsUrl()";
    if (field.tsType === "string") {
      const max = field.maxLength ? `\n  @MaxLength(${field.maxLength})` : "";
      return `@IsString()${max}`;
    }
    return "@IsOptional()";
  });

  Handlebars.registerHelper("nestjsMethod", (method: string) => {
    switch (method) {
      case "GET": return "Get";
      case "POST": return "Post";
      case "PUT": return "Put";
      case "PATCH": return "Patch";
      case "DELETE": return "Delete";
      default: return "Get";
    }
  });

  Handlebars.registerHelper("pathSuffix", (path: string) => {
    // op.path is like "/:id/toggle" but controller already has ":id" param
    // we want "/toggle" appended
    // v1 approach: remove leading "/:id"
    if (!path) return "";
    return path.replace(/^\/:id/, "");
  });
}
```

---

# 3) The code that renders templates to files

### `src/core/render/writers.ts`

```ts
import fs from "fs";
import path from "path";

export function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

export function writeFile(outPath: string, content: string) {
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, content, "utf8");
}
```

### `src/core/render/render.ts`

```ts
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { registerHelpers } from "./hbsHelpers";
import { writeFile } from "./writers";

registerHelpers();

export function renderTemplate(templatePath: string, data: any) {
  const raw = fs.readFileSync(templatePath, "utf8");
  const tpl = Handlebars.compile(raw, { noEscape: true });
  return tpl(data);
}

export function renderToFile(templatePath: string, data: any, outPath: string) {
  const content = renderTemplate(templatePath, data);
  writeFile(outPath, content.endsWith("\n") ? content : content + "\n");
}
```

---

# 4) Generator implementation (NestJS + TypeORM, minimal)

### `src/core/generators/code/nestjs/index.ts`

```ts
import path from "path";
import { renderToFile } from "../../../render/render";
import type { GenerationModel, DomainModel, EntityModel, ServiceModel } from "../../../planner/types";
import { kebabCase } from "../../../planner/naming";

function tpl(name: string) {
  return path.join(process.cwd(), "src/core/generators/code/nestjs/templates", name);
}

export function generateNestJs(model: GenerationModel) {
  // v1: generate only domain modules, entities, dtos, controllers, services, repos, auth stubs.
  for (const domain of model.domains) {
    genDomain(domain, model);
  }

  if (model.authMode === "jwt") {
    renderToFile(tpl("auth.guard.hbs"), {}, path.join(model.outDir, "src/auth/jwt.guard.ts"));
    if (model.rbacEnabled) {
      renderToFile(tpl("roles.decorator.hbs"), {}, path.join(model.outDir, "src/auth/roles.decorator.ts"));
      renderToFile(tpl("rbac.guard.hbs"), {}, path.join(model.outDir, "src/auth/rbac.guard.ts"));
    }
  }
}

function genDomain(domain: DomainModel, model: GenerationModel) {
  const domainPath = path.join(model.outDir, domain.modulePath);

  // entities + dtos
  for (const entity of domain.entities) {
    const entityFileBase = kebabCase(entity.name);
    // entity
    renderToFile(
      tpl("entity.typeorm.hbs"),
      {
        ...entity,
        entityFileBase,
        indexes: [] // v1: add index mapping later if needed
      },
      path.join(domainPath, "entities", `${entityFileBase}.entity.ts`)
    );

    // create dto
    renderToFile(
      tpl("dto.create.hbs"),
      {
        entityName: entity.name,
        entityFileBase,
        fields: entity.fields
      },
      path.join(domainPath, "dtos", `create-${entityFileBase}.dto.ts`)
    );

    // update dto
    renderToFile(
      tpl("dto.update.hbs"),
      { entityName: entity.name, entityFileBase },
      path.join(domainPath, "dtos", `update-${entityFileBase}.dto.ts`)
    );
  }

  // per service: controller/service/repo
  for (const s of domain.services) {
    genService(domain, s, model);
  }

  // domain module
  renderToFile(
    tpl("domain.module.hbs"),
    {
      moduleClass: domain.moduleClass,
      entities: domain.entities.map(e => ({ ...e, entityFileBase: kebabCase(e.name) })),
      services: domain.services
    },
    path.join(domainPath, domain.moduleFile)
  );
}

function genService(domain: DomainModel, s: ServiceModel, model: GenerationModel) {
  const domainPath = path.join(model.outDir, domain.modulePath);
  const serviceDir = path.join(domainPath, s.key);

  const entity = s.entity;
  const entityFileBase = kebabCase(entity.name);

  const has = (x: string) => s.crud.includes(x as any);

  renderToFile(
    tpl("repository.hbs"),
    {
      serviceKey: s.key,
      repoClass: s.repoClass,
      entityName: entity.name,
      entityFileBase
    },
    path.join(serviceDir, `${s.key}.repository.ts`)
  );

  renderToFile(
    tpl("service.hbs"),
    {
      serviceKey: s.key,
      serviceClass: s.serviceClass,
      repoClass: s.repoClass,
      entityName: entity.name,
      entityFileBase,
      hasCreate: has("create"),
      hasFindAll: has("findAll"),
      hasFindOne: has("findOne"),
      hasUpdate: has("update"),
      hasDelete: has("delete"),
      operations: s.operations
    },
    path.join(serviceDir, `${s.key}.service.ts`)
  );

  renderToFile(
    tpl("controller.crud.hbs"),
    {
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

  // v1: merge ops into same controller by appending rendered ops block (optional)
  // simplest: skip ops methods in v1 deliverable OR append if you prefer.
}
```

---

# 5) “Glue” command: generate

### `src/cli/commands/generate.ts` (minimal)

```ts
import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { toGenerationModel } from "../../core/planner/toGenerationModel";
import { generateNestJs } from "../../core/generators/code/nestjs";

export async function generateCmd(specPath: string, outDir: string) {
  const raw = fs.readFileSync(specPath, "utf8");
  const spec = JSON.parse(raw);

  const schemaPath = path.join(process.cwd(), "src/core/schema/designspec.v1.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  if (!validate(spec)) {
    console.error("DesignSpec validation failed:");
    console.error(validate.errors);
    process.exit(1);
  }

  const model = toGenerationModel(spec, outDir);

  generateNestJs(model);

  // Always copy spec for traceability
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "designspec.json"), JSON.stringify(spec, null, 2));
  console.log(`Generated code at: ${outDir}`);
}
```

---

# 6) What you now have (v1 working loop)

**Input:** `designspec.json` (validated)
**Output:** NestJS modules/entities/dtos/services/controllers + auth stubs

This is already sellable in Phase 1 when paired with:

* docs generator (next)
* mermaid diagram generator (next)
* QA gate (npm build)

---

# 7) Next two additions (I recommend immediately)

1. **DocsRenderer** (`docs/architecture.md`, `docs/api.md`)
2. **QA Gate** command: run `npm install`, `npm run build` in output

If you want, I’ll generate:

* `docs/architecture.md.hbs` and `docs/api.md.hbs`
* `diagrams/components.mmd.hbs`
* `archon build` implementation (cross-platform)

