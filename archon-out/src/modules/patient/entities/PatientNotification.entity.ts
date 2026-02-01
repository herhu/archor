import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PatientNotification {
@PrimaryGeneratedColumn()
id: number;

@Column({ nullable: false })
customerId: string;

@Column({ nullable: true })
priority: number;

@Column({ type: 'json', nullable: true })
meta: any;

@Column({ nullable: false })
enabled: boolean;

}