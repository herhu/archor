import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PatientNotification {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ nullable: false })
customerId: string;

@Column({ nullable: false })
enabled: boolean;

@Column({ nullable: false })
portalUrl: string;

}