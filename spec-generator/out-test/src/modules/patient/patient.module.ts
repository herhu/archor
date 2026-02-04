import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientNotificationService } from "./services/patient-notification.service";
import { PatientNotificationController } from "./controllers/patient-notification.controller";
import { PatientNotification } from "./entities/patient-notification.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PatientNotification])],
  controllers: [PatientNotificationController],
  providers: [PatientNotificationService],
})
export class PatientModule {}
