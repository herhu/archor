import * as path from 'path';
import * as fs from 'fs-extra';
import * as Handlebars from 'handlebars';
import { DesignSpec, Domain, Entity, Service } from './spec';
import { writeArtifact } from './io';

// Register helpers
Handlebars.registerHelper('lower', (str) => str.toLowerCase());
Handlebars.registerHelper('capitalize', (str) => str.charAt(0).toUpperCase() + str.slice(1));
Handlebars.registerHelper('kebab', (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
Handlebars.registerHelper('eq', (a, b) => a === b);

export async function generateApp(spec: DesignSpec, outDir: string) {
    const templatesDir = path.join(__dirname, '../../src/templates');

    // 1. Scaffold Base App
    await generateScaffold(spec, outDir, templatesDir);

    // 2. Generate Modules (Domains)
    for (const domain of spec.domains) {
        await generateDomain(domain, outDir, templatesDir);
    }

    // 3. Generate Auth
    await generateAuth(spec, outDir, templatesDir);

    // 4. Generate Docs
    await generateDocs(spec, outDir, templatesDir);
}

async function generateScaffold(spec: DesignSpec, outDir: string, tplDir: string) {
    // package.json
    const pkgTpl = await fs.readFile(path.join(tplDir, 'nestjs/package.json.hbs'), 'utf-8');
    const pkgContent = Handlebars.compile(pkgTpl)({ projectName: spec.name });
    await writeArtifact(path.join(outDir, 'package.json'), pkgContent);

    // tsconfig.json
    const tsConfigTpl = await fs.readFile(path.join(tplDir, 'nestjs/tsconfig.json.hbs'), 'utf-8');
    await writeArtifact(path.join(outDir, 'tsconfig.json'), tsConfigTpl);

    // .env.example
    const envTpl = await fs.readFile(path.join(tplDir, 'nestjs/env.example.hbs'), 'utf-8');
    const envContent = Handlebars.compile(envTpl)({
        projectName: spec.name,
        jwtIssuer: spec.crossCutting?.auth?.jwt?.issuer,
        jwtAudience: spec.crossCutting?.auth?.jwt?.audience,
        jwtJwksUri: spec.crossCutting?.auth?.jwt?.jwksUri,
    });
    await writeArtifact(path.join(outDir, '.env.example'), envContent);

    // Create src content
    const mainTpl = await fs.readFile(path.join(tplDir, 'nestjs/main.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(outDir, 'src/main.ts'), mainTpl);

    const appModuleTpl = await fs.readFile(path.join(tplDir, 'nestjs/app.module.ts.hbs'), 'utf-8');
    // Need to gather all modules to import them
    const moduleNames = spec.domains.map(d => d.name);
    const appModuleContent = Handlebars.compile(appModuleTpl)({ moduleNames });
    await writeArtifact(path.join(outDir, 'src/app.module.ts'), appModuleContent);
}

async function generateDomain(domain: Domain, outDir: string, tplDir: string) {
    const domainKebab = domain.key;
    const domainDir = path.join(outDir, 'src/modules', domainKebab);

    // Module file
    const moduleTpl = await fs.readFile(path.join(tplDir, 'nestjs/module.ts.hbs'), 'utf-8');
    const moduleContent = Handlebars.compile(moduleTpl)({
        domainName: domain.name,
        controllers: domain.services.map(s => s.name + 'Controller'),
        services: domain.services.map(s => s.name),
        entities: domain.entities.map(e => e.name)
    });
    await writeArtifact(path.join(domainDir, `${domainKebab}.module.ts`), moduleContent);

    // Entities
    const entityTpl = await fs.readFile(path.join(tplDir, 'nestjs/entity.ts.hbs'), 'utf-8');
    for (const entity of domain.entities) {
        const content = Handlebars.compile(entityTpl)({ entity });
        await writeArtifact(path.join(domainDir, 'entities', `${entity.name}.entity.ts`), content);
    }

    // Services
    const serviceTpl = await fs.readFile(path.join(tplDir, 'nestjs/service.ts.hbs'), 'utf-8');
    for (const service of domain.services) {
        const relatedEntity = domain.entities[0]; // Simplified: assume first entity is main
        const content = Handlebars.compile(serviceTpl)({ service, entity: relatedEntity });
        await writeArtifact(path.join(domainDir, 'services', `${service.name}.service.ts`), content);
    }

    // Controllers
    const controllerTpl = await fs.readFile(path.join(tplDir, 'nestjs/controller.ts.hbs'), 'utf-8');
    for (const service of domain.services) {
        const relatedEntity = domain.entities[0]; // Simplified
        const content = Handlebars.compile(controllerTpl)({ service, entity: relatedEntity, domainKey: domain.key });
        await writeArtifact(path.join(domainDir, 'controllers', `${service.name}.controller.ts`), content);
    }

    // DTOs (Simplified generic DTO for now)
    const dtoTpl = await fs.readFile(path.join(tplDir, 'nestjs/dto.ts.hbs'), 'utf-8');
    for (const entity of domain.entities) {
        const content = Handlebars.compile(dtoTpl)({ entity });
        await writeArtifact(path.join(domainDir, 'dtos', `create-${entity.name.toLowerCase()}.dto.ts`), content);
    }
}

async function generateAuth(spec: DesignSpec, outDir: string, tplDir: string) {
    const authDir = path.join(outDir, 'src/auth');

    // generic auth module
    const authModuleTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/auth.module.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'auth.module.ts'), authModuleTpl);

    // jwt config
    const jwtConfigTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/jwt.config.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'jwt.config.ts'), jwtConfigTpl);

    // jwt guard
    const jwtGuardTpl = await fs.readFile(path.join(tplDir, 'nestjs/auth/jwt.guard.ts.hbs'), 'utf-8');
    await writeArtifact(path.join(authDir, 'jwt.guard.ts'), jwtGuardTpl);
}


// --- DOCS GENERATOR (Implementing prompt-17 logic) ---

async function generateDocs(spec: DesignSpec, outDir: string, tplDir: string) {
    const docsDir = path.join(outDir, 'docs');
    const endpoints = buildEndpoints(spec);

    const apiTpl = await fs.readFile(path.join(tplDir, 'docs/api.md.hbs'), 'utf-8');
    const content = Handlebars.compile(apiTpl)({
        projectName: spec.name,
        baseUrl: 'http://localhost:3000', // Default
        token: '{{token}}',
        tokenUrl: '{{tokenUrl}}',
        clientId: '{{clientId}}',
        clientSecret: '{{clientSecret}}',
        scope: '{{scope}}',
        endpoints
    });

    await writeArtifact(path.join(docsDir, 'api.md'), content);
}

function buildEndpoints(spec: DesignSpec) {
    const eps: any[] = [];
    for (const d of spec.domains) {
        const domainKey = d.key;
        const entity = d.entities[0];
        const bodyCreate = entity ? exampleBodyForCrud(entity) : undefined;
        // Simplified update body same as create
        const bodyUpdate = bodyCreate;

        for (const s of d.services) {
            const route = s.route; // e.g. 'notifications' -> /notifications
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
                const scope = scopesAll.length ? scopesAll.join(', ') : `${domainKey}:${op.method === 'GET' ? 'read' : 'write'}`;
                const method = op.method;
                const path = `/${route}${op.path}`;
                const ep = {
                    method,
                    path,
                    authRequired: op.authz?.required !== false, // default true
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
        // skip created/updated

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
