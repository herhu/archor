import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientNotification } from '../entities/PatientNotification.entity';
import { CreatePatientNotificationDto } from '../dtos/create-patientnotification.dto';

@Injectable()
export class PatientNotificationServiceService {
constructor(
@InjectRepository(PatientNotification)
private repo: Repository<PatientNotification>,
    ) {}

    async create(dto: CreatePatientNotificationDto): Promise<PatientNotification> {
        const entity = this.repo.create(dto);
        return this.repo.save(entity);
        }

        async findAll(): Promise<PatientNotification[]> {
            return this.repo.find();
            }

            async findOne(id: string): Promise<PatientNotification | null> {
                return this.repo.findOne({ where: { id: id as any } });
                }

                async update(id: string, dto: any): Promise<PatientNotification> {
                    await this.repo.update(id, dto);
                    return this.repo.findOne({ where: { id: id as any } }) as Promise<PatientNotification>;
                        }

                        async delete(id: string): Promise<void> {
                            await this.repo.delete(id);
                            }
                            }