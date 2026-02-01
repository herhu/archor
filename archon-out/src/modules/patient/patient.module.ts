import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientNotificationServiceService } from './services/PatientNotificationService.service';
import { PatientNotificationController } from './controllers/PatientNotificationController.controller';
import { PatientNotification } from './entities/PatientNotification.entity';

@Module({
imports: [
TypeOrmModule.forFeature([
PatientNotification,
]),
],
controllers: [
PatientNotificationController,
],
providers: [
PatientNotificationServiceService,
],
})
export class PatientModule {}