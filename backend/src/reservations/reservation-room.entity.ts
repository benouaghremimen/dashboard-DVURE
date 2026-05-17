import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Room } from '../rooms/room.entity';


export enum ReservationRoomStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Entity()
export class ReservationRoom {
    getOccupiedSlots(start: Date, end: Date) {
        throw new Error('Method not implemented.');
    }
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Reservation, (reservation) => reservation.reservationRooms, { onDelete: 'CASCADE' })
    reservation!: Reservation;

    @ManyToOne(() => Room, (room) => room.reservationRooms)
    room!: Room;

    @Column()
    start_datetime!: Date;

    @Column()
    end_datetime!: Date;

    @Column({
        type: 'enum',
        enum: ReservationRoomStatus,
        default: ReservationRoomStatus.PENDING,
    })
    status!: ReservationRoomStatus;

    @Column({ nullable: true })
    admin_comment?: string;
}
