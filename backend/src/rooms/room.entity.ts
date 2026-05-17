import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ReservationRoom } from '../reservations/reservation-room.entity';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    capacity!: number;

    @Column({ default: true })
    isEnabled!: boolean;

    @Column({ type: 'datetime', nullable: true })
    disabledFrom?: Date | null;

    @Column({ type: 'datetime', nullable: true })
    disabledTo?: Date | null;

    @OneToMany(() => ReservationRoom, (reservationRoom) => reservationRoom.room)
    reservationRooms!: ReservationRoom[];
}
