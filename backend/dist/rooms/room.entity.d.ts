import { ReservationRoom } from '../reservations/reservation-room.entity';
export declare class Room {
    id: number;
    name: string;
    capacity: number;
    isEnabled: boolean;
    disabledFrom?: Date | null;
    disabledTo?: Date | null;
    reservationRooms: ReservationRoom[];
}
//# sourceMappingURL=room.entity.d.ts.map