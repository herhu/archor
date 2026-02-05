Great — we’ll start **Platform Templates** now: `main.ts` + `app.module.ts` (plus the minimum supporting platform files they depend on). This is the “one-time platform layer” that every generated domain plugs into.

Below is the **exact file plan + template contents + generator wiring**. You can copy/paste into your repo and implement in one focused PR.

---

# A) What we will generate (platform layer)

These are **not per-domain**. They are generated once per project.

```
src/
  main.ts
  app.module.ts

  shared/
    config/
      config.schema.ts
      config.module.ts
      config.service.ts
    logging/
      logger.module.ts
      pino.options.ts
    middleware/
      correlation-id.middleware.ts
    filters/
      http-exception.filter.ts
    interceptors/
      transform.interceptor.ts
    health/
      health.module.ts
      health.controller.ts
      health.service.ts
    swagger/
      swagger.ts
```

**Optional later packs** (we’ll not wire these yet unless you want):

* `auth/` keypair + cookie refresh flow
* `/metrics` (prom client)

---

# B) `main.ts` template (platform bootstrap)

### `templates/platform/main.ts.hbs`

```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './shared/swagger/swagger';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

function parseOrigins(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const globalPrefix = process.env.API_PREFIX || '{{apiPrefix}}';
  app.setGlobalPrefix(globalPrefix);

  // Security headers
  {{#if platform.securityHeaders}}
  app.use(helmet());
  {{/if}}

  // Cookies (for future AuthPack / refresh cookies)
  {{#if platform.cookieParser}}
  app.use(cookieParser());
  {{/if}}

  // CORS
  {{#if platform.cors}}
  const origins = parseOrigins(process.env.CORS_ORIGINS);
  app.enableCors({
    origin: origins.length ? origins : true, // dev-friendly
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Correlation-Id'],
    exposedHeaders: ['X-Correlation-Id']
  });
  {{/if}}

  // Body size limits (express defaults are OK; keep explicit for clarity)
  // If you later add file uploads, split limits per route.
  {{#if platform.maxBodySize}}
  app.use(require('express').json({ limit: '{{platform.maxBodySize}}' }));
  app.use(require('express').urlencoded({ extended: true, limit: '{{platform.maxBodySize}}' }));
  {{/if}}

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // Global error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  {{#if platform.swagger}}
  setupSwagger(app);
  {{/if}}

  const port = process.env.PORT ? Number(process.env.PORT) : {{port}};
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`API running: http://localhost:${port}/${globalPrefix}`);
  {{#if platform.swagger}}
  // eslint-disable-next-line no-console
  console.log(`Swagger: http://localhost:${port}/docs`);
  {{/if}}
}

bootstrap();
```

**Notes**

* We keep it deterministic and environment-driven.
* `CORS_ORIGINS` supports `a,b,c`.
* Global filters/pipes are platform defaults.

---

# C) `app.module.ts` template (platform composition)

### `templates/platform/app.module.ts.hbs`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from './shared/config/config.module';
import { LoggerModule } from './shared/logging/logger.module';
import { HealthModule } from './shared/health/health.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

{{#each domainModules}}
import { {{this.className}} } from '{{this.importPath}}';
{{/each}}

@Module({
  imports: [
    ConfigModule,
    LoggerModule,

    {{#if platform.throttling}}
    ThrottlerModule.forRoot([{
      ttl: Number(process.env.RATE_LIMIT_TTL ?? {{platform.rateLimitTtl}}),
      limit: Number(process.env.RATE_LIMIT_MAX ?? {{platform.rateLimitMax}})
    }]),
    {{/if}}

    HealthModule,

    // Domain modules
    {{#each domainModules}}
    {{this.className}},
    {{/each}}
  ],
  providers: [
    {{#if platform.throttling}}
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
    {{/if}}
  ]
})
export class AppModule {}
```

**Key point:** your generator already creates domain modules. This template just imports them and mounts them.

---

# D) Minimal supporting platform files

## 1) Config with validation (simple, strong default)

### `templates/platform/shared/config/config.schema.ts.hbs`

```ts
import * as Joi from 'joi';

export const configSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default({{port}}),

  API_PREFIX: Joi.string().default('{{apiPrefix}}'),

  {{#if platform.cors}}
  CORS_ORIGINS: Joi.string().allow('').default(''),
  {{/if}}

  {{#if platform.throttling}}
  RATE_LIMIT_TTL: Joi.number().default({{platform.rateLimitTtl}}),
  RATE_LIMIT_MAX: Joi.number().default({{platform.rateLimitMax}}),
  {{/if}}

  DATABASE_URL: Joi.string().required()
}).unknown(true);
```

### `templates/platform/shared/config/config.module.ts.hbs`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema } from './config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
      envFilePath: ['.env']
    })
  ]
})
export class ConfigModule {}
```

> This is the “crash fast if broken env” baseline.

---

## 2) Logging module (pino baseline)

### `templates/platform/shared/logging/logger.module.ts.hbs`

```ts
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { pinoOptions } from './pino.options';

@Module({
  imports: [
    PinoLoggerModule.forRoot(pinoOptions())
  ],
  exports: [PinoLoggerModule]
})
export class LoggerModule {}
```

### `templates/platform/shared/logging/pino.options.ts.hbs`

```ts
export function pinoOptions() {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        remove: true
      },
      transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: { singleLine: true, colorize: true }
          },
      genReqId: function(req: any, res: any) {
        return req.headers['x-correlation-id'] || undefined;
      }
    }
  };
}
```

---

## 3) Correlation ID middleware

### `templates/platform/shared/middleware/correlation-id.middleware.ts.hbs`

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const incoming = req.headers['x-correlation-id'];
    const id = typeof incoming === 'string' && incoming.length ? incoming : randomUUID();

    req.headers['x-correlation-id'] = id;
    res.setHeader('X-Correlation-Id', id);

    next();
  }
}
```

---

## 4) Global exception filter (consistent error shape)

### `templates/platform/shared/filters/http-exception.filter.ts.hbs`

```ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const correlationId = req.headers['x-correlation-id'];

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof payload === 'string'
        ? payload
        : (payload as any).message || (payload as any).error || 'Error';

    res.status(status).json({
      statusCode: status,
      message,
      path: req.url,
      correlationId,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 5) Transform interceptor (safe serialization)

### `templates/platform/shared/interceptors/transform.interceptor.ts.hbs`

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map(data => instanceToPlain(data)));
  }
}
```

(We’ll wire it globally later if you want; right now we already used it in your mentee patterns.)

---

## 6) Health module (liveness + readiness)

### `templates/platform/shared/health/health.module.ts.hbs`

```ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService]
})
export class HealthModule {}
```

### `templates/platform/shared/health/health.controller.ts.hbs`

```ts
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  async readiness() {
    const ok = await this.health.dbReady();
    if (!ok) throw new ServiceUnavailableException('Database not ready');
    return { status: 'ok' };
  }
}
```

### `templates/platform/shared/health/health.service.ts.hbs`

```ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly ds: DataSource) {}

  async dbReady(): Promise<boolean> {
    try {
      await this.ds.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## 7) Swagger setup

### `templates/platform/shared/swagger/swagger.ts.hbs`

```ts
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const title = process.env.APP_NAME || '{{projectName}}';
  const prefix = process.env.API_PREFIX || '{{apiPrefix}}';

  const cfg = new DocumentBuilder()
    .setTitle(title)
    .setDescription('Generated backend scaffold')
    .setVersion(process.env.APP_VERSION || '0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();

  const doc = SwaggerModule.createDocument(app, cfg);
  SwaggerModule.setup('/docs', app, doc);

  app.use('/openapi.json', (_req, res) => res.json(doc));
}
```

---

# E) Generator wiring changes (what you implement)

## 1) In generator.ts: generate platform files once

Add a function:

```ts
async function generatePlatform(outDir: string, model: GenerationModel, dryRun: boolean) {
  // renderToFile(template, data, target)
}
```

Call it before domains:

```ts
await generatePlatform(outDir, model, dryRun);
await generateDomains(outDir, model, dryRun);
```

## 2) Pass domain module imports into `app.module.ts.hbs`

Compute this list in generator:

```ts
const domainModules = model.domains.map(d => ({
  className: `${d.className}Module`, // ex PatientModule
  importPath: `./modules/${d.key}/${d.key}.module`
}));
```

Render:

* `src/app.module.ts`
* `src/main.ts`
* `src/shared/**`

## 3) Add required dependencies

Update template `package.json.hbs` to include:

* `@nestjs/config`
* `joi`
* `nestjs-pino`, `pino-pretty`
* `helmet`
* `cookie-parser`
* `@nestjs/throttler`
* `@nestjs/swagger`, `swagger-ui-express`

(We’ll keep them behind flags later, but for now baseline is okay.)

---

# F) Platform feature flags (we can hardcode first)

For this milestone, you can hardcode defaults in spec normalization:

```ts
platform: {
  cors: true,
  cookieParser: true,
  securityHeaders: true,
  swagger: true,
  throttling: true,
  rateLimitTtl: 60,
  rateLimitMax: 100,
  maxBodySize: "1mb"
}
```

Later you’ll move these into DesignSpec v1.1.

---

# What I need from you next

Before you code: tell me your preferred defaults for **2 numbers**:

* `rateLimitMax` (100/min is standard)
* `API prefix` (`api/v1` vs `api`)

If you don’t answer, I’ll assume:

* `api/v1`
* `100 requests / 60s`

And you can ship the milestone.
