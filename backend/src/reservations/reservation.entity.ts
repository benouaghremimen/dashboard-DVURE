import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { ReservationRoom } from './reservation-room.entity';

export enum ReservationType {
  ANNUELLE = 'ANNUELLE',
  HEBDO = 'HEBDO',
  UNIQUE = 'UNIQUE',
}

export enum ReservationGlobalStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  club!: User;

  @Column()
  event_name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReservationType,
  })
  type!: ReservationType;

  @Column({
    type: 'enum',
    enum: ReservationGlobalStatus,
    default: ReservationGlobalStatus.PENDING,
  })
  global_status!: ReservationGlobalStatus;

  @Column({ type: 'datetime', nullable: true })
  cancelled_at?: Date;

  @Column({ type: 'text', nullable: true })
  cancellation_reason?: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => ReservationRoom, (reservationRoom) => reservationRoom.reservation)
  reservationRooms!: ReservationRoom[];
}
