import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "./shared/config/config.module";
import { LoggerModule } from "./shared/logging/logger.module";
import { HealthModule } from "./shared/health/health.module";
import { CorrelationIdMiddleware } from "./shared/middleware/correlation-id.middleware";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

import { PatientModule } from "./modules/patient/patient.module";

@Module({
  imports: [
    ConfigModule,
    LoggerModule,

    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL ?? 60),
        limit: Number(process.env.RATE_LIMIT_MAX ?? 100),
      },
    ]),

    HealthModule,

    // Domain modules
    PatientModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
