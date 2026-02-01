import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientNotificationService } from './services/PatientNotification.service';
import { PatientNotificationController } from './controllers/PatientNotification.controller';
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
PatientNotificationService,
],
})
export class PatientModule {}