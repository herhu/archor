"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = require("cookie-parser");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const swagger_1 = require("./shared/swagger/swagger");
const http_exception_filter_1 = require("./shared/filters/http-exception.filter");
function parseOrigins(raw) {
    if (!raw)
        return [];
    return raw.split(',').map(s => s.trim()).filter(Boolean);
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true
    });
    const globalPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(globalPrefix);
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    const origins = parseOrigins(process.env.CORS_ORIGINS);
    app.enableCors({
        origin: origins.length ? origins : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
        exposedHeaders: ['X-Correlation-Id']
    });
    app.use(require('express').json({ limit: '1mb' }));
    app.use(require('express').urlencoded({ extended: true, limit: '1mb' }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    (0, swagger_1.setupSwagger)(app);
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    console.log(`API running: http://localhost:${port}/${globalPrefix}`);
    console.log(`Swagger: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map