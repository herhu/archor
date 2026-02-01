import { PatientNotificationService } from '../services/PatientNotification.service';
import { CreatePatientNotificationDto } from '../dtos/create-patientnotification.dto';
export declare class PatientNotificationController {
    private readonly service;
    constructor(service: PatientNotificationService);
    create(dto: CreatePatientNotificationDto): Promise<import("../entities/PatientNotification.entity").PatientNotification>;
    findAll(): Promise<import("../entities/PatientNotification.entity").PatientNotification[]>;
    findOne(id: string): Promise<import("../entities/PatientNotification.entity").PatientNotification>;
    update(id: string, dto: any): Promise<import("../entities/PatientNotification.entity").PatientNotification>;
    delete(id: string): Promise<void>;
    Toggle(body: any): Promise<{
        message: string;
    }>;
    Status(): Promise<{
        message: string;
    }>;
}
