import { Reservation } from './reservation.entity';
import { Room } from '../rooms/room.entity';
export declare enum ReservationRoomStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class ReservationRoom {
    getOccupiedSlots(start: Date, end: Date): void;
    id: number;
    reservation: Reservation;
    room: Room;
    start_datetime: Date;
    end_datetime: Date;
    status: ReservationRoomStatus;
    admin_comment?: string;
}
//# sourceMappingURL=reservation-room.entity.d.ts.map