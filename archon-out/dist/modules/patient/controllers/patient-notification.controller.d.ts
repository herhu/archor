import { PatientNotificationService } from '../services/patient-notification.service';
import { CreatePatientNotificationDto } from '../dtos/create-patient-notification.dto';
export declare class PatientNotificationController {
    private readonly service;
    constructor(service: PatientNotificationService);
    create(dto: CreatePatientNotificationDto): Promise<import("../entities/patient-notification.entity").PatientNotification>;
    findAll(): Promise<import("../entities/patient-notification.entity").PatientNotification[]>;
    findOne(id: number): Promise<import("../entities/patient-notification.entity").PatientNotification>;
    update(id: number, dto: any): Promise<import("../entities/patient-notification.entity").PatientNotification>;
    delete(id: number): Promise<void>;
    Toggle(body: any): Promise<{
        message: string;
    }>;
    Status(): Promise<{
        message: string;
    }>;
}
