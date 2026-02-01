import { Repository } from 'typeorm';
import { PatientNotification } from '../entities/patient-notification.entity';
import { CreatePatientNotificationDto } from '../dtos/create-patient-notification.dto';
export declare class PatientNotificationService {
    private repo;
    constructor(repo: Repository<PatientNotification>);
    create(dto: CreatePatientNotificationDto): Promise<PatientNotification>;
    findAll(): Promise<PatientNotification[]>;
    findOne(id: number): Promise<PatientNotification | null>;
    update(id: number, dto: any): Promise<PatientNotification>;
    delete(id: number): Promise<void>;
}
