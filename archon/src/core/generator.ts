import * as path from 'path';
import * as fs from 'fs-extra';
import * as Handlebars from 'handlebars';
import { DesignSpec, Domain, Entity, Service } from './spec';
import { writeArtifact } from './io';

// Register helpers
Handlebars.registerHelper('lower', (str) => str.toLowerCase());
Handlebars.registerHelper('capitalize', (str) => str.charAt(0).toUpperCase() + str.slice(1));
Handlebars.registerHelper('kebab', (str) => str.replace(/\s+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('nestjsMethod', (method) => {
    switch (String(method).toUpperCase()) {
        case 'GET': return 'Get';
        case 'POST': return 'Post';
        case 'PUT': return 'Put';
        case 'PATCH': return 'Patch';
        case 'DELETE': return 'Delete';
        default: return 'Get';
    }
});

export async function generateApp(spec: DesignSpec, outDir: string, dryRun: boolean = false) {
    // Robust template path resolution
    let templatesDir = path.join(__dirname, '../../src/templates'); // Source mode
    if (!fs.existsSync(templatesDir)) {
        templatesDir = path.join(__dirname, '../templates'); // Dist mode (if copied to src/templates)
    }
    if (!fs.existsSync(templatesDir)) {
        templatesDir = path.join(__dirname, '../../templates'); // Dist mode alternative
    }

    // --- Module Injection Metadata Pre-calculation ---
    const modules = spec.modules || [];
    const hasRedis = modules.some(m => m.type === 'cache.redis');
    const hasQueue = modules.some(m => m.type === 'queue.bullmq');

    // Prepare list of modules to inject into AppModule
    const injectedModules: { className: string; importPath: string }[] = [];
    if (hasRedis) {
        injectedModules.push({
            className: 'RedisModule',
            importPath: './modules/core/redis/redis.module'
        });
    }
    if (hasQueue) {
        injectedModules.push({
            className: 'QueueModule',
            importPath: './modules/core/queue/queue.module'
        });
    }

    const context = { hasRedis, hasQueue, injectedModules };

    // 1. Scaffold Base App
    await generateScaffold(spec, outDir, templatesDir, dryRun, context);

    // 1.5 Generate Injected Modules
    await generateInjectedModules(spec, outDir, templatesDir, dryRun);

    // 1.6 Generate Platform
    await generatePlatform(spec, outDir, templatesDir, dryRun, context);

    // 2. Generate Modules (Domains)
    for (const domain of spec.domains) {
        await generateDomain(domain, outDir, templatesDir, dryRun);
    }

    // 3. Generate Auth
    await generateAuth(spec, outDir, templatesDir, dryRun);

    // 4. Generate Docs
    await generateDocs(spec, outDir, templatesDir, dryRun);

    // 5. Generate README
    await generateReadme(spec, outDir, templatesDir, dryRun);

    // 6. Generate Scripts
    await generateScripts(spec, outDir, templatesDir, dryRun);
}

async function generateScaffold(spec: DesignSpec, outDir: string, tplDir: string, dryRun: boolean, context: any) {
    // package.json
    const pkgTpl = await fs.readFile(path.join(tplDir, 'nestjs/package.json.hbs'), 'utf-8');
    const pkgContent = Handlebars.compile(pkgTpl)({ projectName: spec.name, ...context });
    await writeArtifact(path.join(outDir, 'package.json'), pkgContent, dryRun);

    // tsconfig.json
    const tsConfigTpl = await fs.readFile(path.join(tplDir, 'nestjs/tsconfig.json.hbs'), 'utf-8');
    await writeArtifact(path.join(outDir, 'tsconfig.json'), tsConfigTpl, dryRun);

    // .env.example
    const envTpl = await fs.readFile(path.join(tplDir, 'nestjs/env.example.hbs'), 'utf-8');
    const envContent = Handlebars.compile(envTpl)({
        projectName: spec.name,
        jwtIssuer: spec.crossCutting?.auth?.jwt?.issuer,
        jwtAudience: spec.crossCutting?.auth?.jwt?.audience,
        jwtJwksUri: spec.crossCutting?.auth?.jwt?.jwksUri,
        ...context
    });
    await writeArtifact(path.join(outDir, '.env.example'), envContent, dryRun);

    // .gitignore
    const gitignoreTpl = await fs.readFile(path.join(tplDir, 'nestjs/gitignore.hbs'), 'utf-8');
    await writeArtifact(path.join(outDir, '.gitignore'), gitignoreTpl, dryRun);
}

function toKebab(s: string) {
    return s
        .replace(/Service$/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
}

function normalizeService(service: Service) {
    const baseName = service.name.replace(/Service$/, ''); // PascalCase name

    const fileBase = toKebab(baseName); // kebab-case for filenames

    // Service
    const serviceClassName = `${baseName}Service`;
    const serviceFileName = `${fileBase}.service`; // no extension

    // Controller
    const controllerClassName = `${baseName}Controller`;
    const controllerFileName = `${fileBase}.controller`; // no extension

    return {
        baseName,
        fileBase,
        serviceClassName,
        serviceFileName,
        controllerClassName,
        controllerFileName,
        importPathService: `./services/${serviceFileName}`,
        importPathController: `./controllers/${controllerFileName}`,
    };
}


function kebab(str: string) {
    return str.replace(/\s+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

async function generateDomain(domain: Domain, outDir: string, tplDir: string, dryRun: boolean) {
    const domainKebab = domain.key;
    const domainDir = path.join(outDir, 'src/modules', domainKebab);

    // Normalize services
    const normalizedServices = domain.services.map(s => normalizeService(s));

    // Module file
    const moduleTpl = await fs.readFile(path.join(tplDir, 'nestjs/module.ts.hbs'), 'utf-8');
    const moduleContent = Handlebars.compile(moduleTpl)({
        domainName: domain.name,
        moduleClassName: domain.key.charAt(0).toUpperCase() + domain.key.slice(1) + 'Module',
        controllers: normalizedServices.map(s => ({
            className: s.controllerClassName,
            importPath: s.importPathController
        })),
        services: normalizedServices.map(s => ({
            className: s.serviceClassName,
            importPath: s.importPathService
        })),
        entities: domain.entities.map(e => e.name) // Entities might need import path fix if we change their filenames
    });
    await writeArtifact(path.join(domainDir, `${domainKebab}.module.ts`), moduleContent, dryRun);

    // Entities
    const entityTpl = await fs.readFile(path.join(tplDir, 'nestjs/entity.ts.hbs'), 'utf-8');
    for (const entity of domain.entities) {
        const content = Handlebars.compile(entityTpl)({ entity });
        const entityFileName = kebab(entity.name);
        await writeArtifact(
            path.join(domainDir, 'entities', `${toKebab(entity.name)}.entity.ts`),
            content,
            dryRun
        );

    }

    // Services
    const serviceTpl = await fs.readFile(path.join(tplDir, 'nestjs/service.ts.hbs'), 'utf-8');
    for (const service of domain.services) {
        let relatedEntity = domain.entities[0];
        if (service.entity) {
            relatedEntity = domain.entities.find(e => e.name === service.entity) || relatedEntity;
        }

        const norm = normalizeService(service);
        const idType = relatedEntity.fields.find(f => f.primary)?.type === 'int' ? 'number' : 'string';

        const content = Handlebars.compile(serviceTpl)({
            service,
            serviceClassName: norm.serviceClassName,
            entity: relatedEntity,
            entityImportPath: `../entities/${kebab(relatedEntity.name)}.entity`,
            idType
        });
        await writeArtifact(path.join(domainDir, 'services', `${norm.serviceFileName}.ts`), content, dryRun);
    }

    // Controllers
    const controllerTpl = await fs.readFile(path.join(tplDir, 'nestjs/controller.ts.hbs'), 'utf-8');
    for (const service of domain.services) {
        let relatedEntity = domain.entities[0];
        if (service.entity) {
            relatedEntity = domain.entities.find(e => e.name === service.entity) || relatedEntity;
        }
        const crudFlags = {
            create: service.crud?.includes('create'),
            findAll: service.crud?.includes('findAll'),
            findOne: service.crud?.includes('findOne'),
            update: service.crud?.includes('update'),
            delete: service.crud?.includes('delete'),
        };

        const crudScopes = {
            create: [`${domain.key}:write`],
            findAll: [`${domain.key}:read`],
            findOne: [`${domain.key}:read`],
            update: [`${domain.key}:write`],
            delete: [`${domain.key}:write`],
        };

        const operations = service.operations?.map(op => ({
            ...op,
            authRequired: op.authz?.required !== false,
        }));

        const norm = normalizeService(service);

        const content = Handlebars.compile(controllerTpl)({
            service,
            controllerClassName: norm.controllerClassName,
            serviceClassName: norm.serviceClassName,
            serviceImportPath: `../services/${norm.serviceFileName}`,
            entity: relatedEntity,
            entityImportPath: `../entities/${kebab(relatedEntity.name)}.entity`, // Pass clean path
            domainKey: domain.key,
            crud: crudFlags,
            crudScopes,
            operations: operations,
            // Planner-level ID type
            idType: relatedEntity.fields.find(f => f.primary)?.type === 'int' ? 'number' : 'string'
        });
        await writeArtifact(path.join(domainDir, 'controllers', `${norm.controllerFileName}.ts`), content, dryRun);
    }

    // DTOs
    const dtoTpl = await fs.readFile(path.join(tplDir, 'nestjs/dto.ts.hbs'), 'utf-8');
    for (const entity of domain.entities) {
        const content = Handlebars.compile(dtoTpl)({ entity });
        await writeArtifact(
            path.join(domainDir, 'dtos', `create-${toKebab(entity.name)}.dto.ts`),
            content,
            dryRun
        );

    }
}

async function generateAuth(spec: DesignSpec, outDir: string, tplDir: string, dryRun: boolean) {
    const authDir = path.join(outDir, 'src/auth');

    // generic auth module
    const authModuleTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/auth.module.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'auth.module.ts'), authModuleTpl, dryRun);

    // jwt config
    const jwtConfigTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/jwt.config.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'jwt.config.ts'), jwtConfigTpl, dryRun);

    // jwt guard
    const jwtGuardTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/jwt.guard.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'jwt.guard.ts'), jwtGuardTpl, dryRun);

    // scopes decorator
    const scopesDecTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/scopes.decorator.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'scopes.decorator.ts'), scopesDecTpl, dryRun);

    // scopes guard
    const scopesGuardTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/scopes.guard.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'scopes.guard.ts'), scopesGuardTpl, dryRun);
}

async function generateReadme(spec: DesignSpec, outDir: string, tplDir: string, dryRun: boolean) {
    const readmeTpl = await fs.readFile(path.join(tplDir, 'nestjs/README.md.hbs'), 'utf-8');
    const content = Handlebars.compile(readmeTpl)({ projectName: spec.name });
    await writeArtifact(path.join(outDir, 'README.md'), content, dryRun);
}

// 7.5. Generate Injected Modules
async function generateInjectedModules(spec: DesignSpec, outDir: string, tplDir: string, dryRun: boolean) {
    if (!spec.modules || spec.modules.length === 0) return;

    for (const mod of spec.modules) {
        if (mod.type === 'cache.redis') {
            const tpl = await fs.readFile(path.join(tplDir, 'modules/redis/redis.module.ts.hbs'), 'utf-8');
            const content = Handlebars.compile(tpl)({ config: mod.config });
            await writeArtifact(path.join(outDir, 'src/modules/core/redis/redis.module.ts'), content, dryRun);
        }
        else if (mod.type === 'queue.bullmq') {
            const tpl = await fs.readFile(path.join(tplDir, 'modules/queue/queue.module.ts.hbs'), 'utf-8');
            const content = Handlebars.compile(tpl)({ config: mod.config });
            await writeArtifact(path.join(outDir, 'src/modules/core/queue/queue.module.ts'), content, dryRun);
        }
    }
}

// 6. Generate Scripts
async function generateScripts(spec: DesignSpec, outDir: string, tplDir: string, dryRun: boolean) {
    const scriptsDir = path.join(outDir, 'scripts');

    const tokenUrl = spec.crossCutting?.auth?.jwt?.issuer ? `${spec.crossCutting.auth.jwt.issuer}/oauth/token` : 'YOUR_TOKEN_URL';

    const getTokenTpl = await fs.readFile(path.join(tplDir, 'scripts/get-token.sh.hbs'), 'utf-8');
    const getTokenContent = Handlebars.compile(getTokenTpl)({
        tokenUrl,
        clientId: 'YOUR_CLIENT_ID',
        clientSecret: 'YOUR_CLIENT_SECRET',
        audience: spec.crossCutting?.auth?.jwt?.audience ?? 'YOUR_AUDIENCE',
        defaultScopes: spec.crossCutting?.auth?.jwt?.defaultScopes ?? 'openid profile'
    });

    const curlTpl = await fs.readFile(path.join(tplDir, 'scripts/curl.sh.hbs'), 'utf-8');

    await writeArtifact(path.join(scriptsDir, 'get-token.sh'), getTokenContent, dryRun);
    await writeArtifact(path.join(scriptsDir, 'curl.sh'), curlTpl, dryRun);

    if (!dryRun) {
        try {
            await fs.chmod(path.join(scriptsDir, 'get-token.sh'), '755');
            await fs.chmod(path.join(scriptsDir, 'curl.sh'), '755');
        } catch (e) { }
    }
}


// --- DOCS GENERATOR ---

async function generateDocs(spec: DesignSpec, outDir: string, tplDir: string, dryRun: boolean) {
    const docsDir = path.join(outDir, 'docs');
    const endpoints = buildEndpoints(spec);

    const apiTpl = await fs.readFile(path.join(tplDir, 'docs/api.md.hbs'), 'utf-8');
    const content = Handlebars.compile(apiTpl)({
        projectName: spec.name,
        baseUrl: '{{baseUrl}}', // Literal placeholder for Postman compatibility
        token: '{{token}}',
        tokenUrl: '{{tokenUrl}}',
        clientId: '{{clientId}}',
        clientSecret: '{{clientSecret}}',
        scope: '{{scope}}',
        endpoints
    });

    await writeArtifact(path.join(docsDir, 'api.md'), content, dryRun);
}

function buildEndpoints(spec: DesignSpec) {
    const eps: any[] = [];
    for (const d of spec.domains) {
        const domainKey = d.key;
        const entity = d.entities[0];
        const bodyCreate = entity ? exampleBodyForCrud(entity) : undefined;
        const bodyUpdate = bodyCreate;

        for (const s of d.services) {
            const route = s.route;
            const crud = new Set(s.crud ?? []);

            if (crud.has('create')) {
                const ep = {
                    method: 'POST',
                    path: `/${route}`,
                    authRequired: true,
                    scope: `${domainKey}:write`,
                    description: 'Create resource',
                    body: bodyCreate
                };
                eps.push({ ...ep, curl: curlForEndpoint(ep) });
            }
            if (crud.has('findAll')) {
                const ep = {
                    method: 'GET',
                    path: `/${route}`,
                    authRequired: true,
                    scope: `${domainKey}:read`,
                    description: 'List resources'
                };
                eps.push({ ...ep, curl: curlForEndpoint(ep) });
            }
            if (crud.has('findOne')) {
                const ep = {
                    method: 'GET',
                    path: `/${route}/:id`,
                    authRequired: true,
                    scope: `${domainKey}:read`,
                    description: 'Get resource by id'
                };
                eps.push({ ...ep, curl: curlForEndpoint(ep) });
            }
            if (crud.has('update')) {
                const ep = {
                    method: 'PATCH',
                    path: `/${route}/:id`,
                    authRequired: true,
                    scope: `${domainKey}:write`,
                    description: 'Update resource',
                    body: bodyUpdate
                };
                eps.push({ ...ep, curl: curlForEndpoint(ep) });
            }
            if (crud.has('delete')) {
                const ep = {
                    method: 'DELETE',
                    path: `/${route}/:id`,
                    authRequired: true,
                    scope: `${domainKey}:write`,
                    description: 'Delete resource'
                };
                eps.push({ ...ep, curl: curlForEndpoint(ep) });
            }

            // Operations
            for (const op of s.operations ?? []) {
                const scopesAll = op.authz?.scopesAll ?? [];
                let scope = scopesAll.length ? scopesAll.join(', ') : `${domainKey}:${op.method === 'GET' ? 'read' : 'write'}`;
                const method = op.method;
                const path = `/${route}${op.path}`;
                const authRequired = op.authz?.required !== false;

                if (!authRequired) {
                    scope = '-';
                }

                const ep = {
                    method,
                    path,
                    authRequired,
                    scope,
                    description: `Operation: ${op.name}`,
                    body: method === 'GET' ? undefined : (op.request?.schemaRef ? { "example": "TODO schema ref" } : undefined)
                };
                eps.push({ ...ep, curl: curlForEndpoint(ep) });
            }
        }
    }
    return eps;
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

function exampleBodyForCrud(entity: Entity) {
    const ex: Record<string, any> = {};
    for (const f of entity?.fields ?? []) {
        const name = f.name;
        if (name === entity.primaryKey) continue;

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

// 7. Generate Platform Layer
async function generatePlatform(spec: DesignSpec, outDir: string, tplDir: string, dryRun: boolean, extraContext: any = {}) {
    const platformDefaults = {
        cors: true,
        cookieParser: true,
        securityHeaders: true,
        swagger: true,
        throttling: true,
        rateLimitTtl: 60,
        rateLimitMax: 100,
        maxBodySize: "1mb"
    };

    // Use values from spec if available, otherwise defaults
    const platform = { ...platformDefaults, ...(spec as any).platform };

    // Hardcoded for now as requested
    const apiPrefix = 'api/v1';
    const port = 3000;

    const domainModules = spec.domains.map(d => ({
        className: d.key.charAt(0).toUpperCase() + d.key.slice(1) + 'Module',
        importPath: `./modules/${d.key}/${d.key}.module`
    }));

    const context = {
        platform,
        domainModules,
        apiPrefix,
        port,
        projectName: spec.name,
        injectedModules: extraContext.injectedModules || []
    };

    // Helper to render platform file
    const render = async (srcRel: string, destRel: string) => {
        const tpl = await fs.readFile(path.join(tplDir, 'platform', srcRel), 'utf-8');
        const content = Handlebars.compile(tpl)(context);
        await writeArtifact(path.join(outDir, destRel), content, dryRun);
    };

    // Main files
    await render('main.ts.hbs', 'src/main.ts');
    await render('app.module.ts.hbs', 'src/app.module.ts');

    // Shared files
    await render('shared/config/config.schema.ts.hbs', 'src/shared/config/config.schema.ts');
    await render('shared/config/config.module.ts.hbs', 'src/shared/config/config.module.ts');

    await render('shared/logging/logger.module.ts.hbs', 'src/shared/logging/logger.module.ts');
    await render('shared/logging/pino.options.ts.hbs', 'src/shared/logging/pino.options.ts');

    await render('shared/middleware/correlation-id.middleware.ts.hbs', 'src/shared/middleware/correlation-id.middleware.ts');

    await render('shared/filters/http-exception.filter.ts.hbs', 'src/shared/filters/http-exception.filter.ts');

    await render('shared/interceptors/transform.interceptor.ts.hbs', 'src/shared/interceptors/transform.interceptor.ts');

    await render('shared/health/health.module.ts.hbs', 'src/shared/health/health.module.ts');
    await render('shared/health/health.controller.ts.hbs', 'src/shared/health/health.controller.ts');
    await render('shared/health/health.service.ts.hbs', 'src/shared/health/health.service.ts');

    await render('shared/swagger/swagger.ts.hbs', 'src/shared/swagger/swagger.ts');
}
