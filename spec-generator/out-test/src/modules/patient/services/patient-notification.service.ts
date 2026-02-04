import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PatientNotification } from "../entities/patient-notification.entity";
import { CreatePatientNotificationDto } from "../dtos/create-patient-notification.dto";

@Injectable()
export class PatientNotificationService {
  constructor(
    @InjectRepository(PatientNotification)
    private repo: Repository<PatientNotification>,
  ) {}

  async create(
    dto: CreatePatientNotificationDto,
  ): Promise<PatientNotification> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(): Promise<PatientNotification[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<PatientNotification | null> {
    return this.repo.findOne({ where: { id: id as any } });
  }

  async update(id: number, dto: any): Promise<PatientNotification> {
    await this.repo.update(id as any, dto);
    return this.repo.findOne({
      where: { id: id as any },
    }) as Promise<PatientNotification>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id as any);
  }
}
