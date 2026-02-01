import { Repository } from 'typeorm';
import { PatientNotification } from '../entities/PatientNotification.entity';
import { CreatePatientNotificationDto } from '../dtos/create-patientnotification.dto';
export declare class PatientNotificationService {
    private repo;
    constructor(repo: Repository<PatientNotification>);
    create(dto: CreatePatientNotificationDto): Promise<PatientNotification>;
    findAll(): Promise<PatientNotification[]>;
    findOne(id: string): Promise<PatientNotification | null>;
    update(id: string, dto: any): Promise<PatientNotification>;
    delete(id: string): Promise<void>;
}
