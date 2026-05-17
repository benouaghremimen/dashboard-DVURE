import { User } from '../users/user.entity';
import { ReservationRoom } from './reservation-room.entity';
export declare enum ReservationType {
    ANNUELLE = "ANNUELLE",
    HEBDO = "HEBDO",
    UNIQUE = "UNIQUE"
}
export declare enum ReservationGlobalStatus {
    PENDING = "PENDING",
    PARTIAL = "PARTIAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare class Reservation {
    id: number;
    club: User;
    event_name: string;
    description?: string;
    type: ReservationType;
    global_status: ReservationGlobalStatus;
    cancelled_at?: Date;
    cancellation_reason?: string;
    created_at: Date;
    reservationRooms: ReservationRoom[];
}
//# sourceMappingURL=reservation.entity.d.ts.map