import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { setupSwagger } from "./shared/swagger/swagger";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

function parseOrigins(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Use structured logger
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();

  // Graceful shutdown
  app.enableShutdownHooks();

  const globalPrefix = process.env.API_PREFIX || "api/v1";
  app.setGlobalPrefix(globalPrefix);

  // Security headers
  app.use(helmet());

  // Cookies (for future AuthPack / refresh cookies)
  app.use(cookieParser());

  // CORS
  const isProd = process.env.NODE_ENV === "production";
  const rawOrigins = process.env.CORS_ORIGINS;
  let origins: string[] | boolean = parseOrigins(rawOrigins);

  if (isProd && Array.isArray(origins) && origins.length === 0) {
    // Fail secure in production
    throw new Error(
      "Using production mode but CORS_ORIGINS is empty. Set it to allowed domains.",
    );
  }

  // Dev-friendly: allow all if no explicit origins (and not prod)
  if (!isProd && (!Array.isArray(origins) || origins.length === 0)) {
    origins = true;
  }

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-Id"],
    exposedHeaders: ["X-Correlation-Id"],
  });

  // Body size limits (Using NestJS platform adapter, avoiding direct express require)
  const maxBodySize = process.env.MAX_BODY_SIZE || "1mb";
  app.useBodyParser("json", { limit: maxBodySize });
  app.useBodyParser("urlencoded", { extended: true, limit: maxBodySize });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  setupSwagger(app);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  const logger = app.get(PinoLogger);
  logger.info(`API running: http://localhost:${port}/${globalPrefix}`);
  logger.info(`Swagger: http://localhost:${port}/docs`);
}

bootstrap();
