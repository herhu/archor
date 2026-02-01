import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientNotificationServiceService } from './services/PatientNotificationService.service';
import { PatientNotificationServiceController } from './controllers/PatientNotificationServiceController.controller';
import { PatientNotification } from './entities/PatientNotification.entity';

@Module({
imports: [
TypeOrmModule.forFeature([
PatientNotification,
]),
],
controllers: [
PatientNotificationServiceController,
],
providers: [
PatientNotificationServiceService,
],
})
export class Patient DomainModule {}