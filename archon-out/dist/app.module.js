"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./shared/config/config.module");
const logger_module_1 = require("./shared/logging/logger.module");
const health_module_1 = require("./shared/health/health.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const throttler_2 = require("@nestjs/throttler");
const patient_module_1 = require("./modules/patient/patient.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: Number(process.env.RATE_LIMIT_TTL ?? 60),
                    limit: Number(process.env.RATE_LIMIT_MAX ?? 100)
                }]),
            health_module_1.HealthModule,
            patient_module_1.PatientModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_2.ThrottlerGuard
            }
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map