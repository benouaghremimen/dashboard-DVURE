import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { ReservationRoom, ReservationRoomStatus } from './reservation-room.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReservationAdminService {
    private readonly reservationRepo;
    private readonly roomRepo;
    private readonly notificationsService;
    constructor(reservationRepo: Repository<Reservation>, roomRepo: Repository<ReservationRoom>, notificationsService: NotificationsService);
    findAll(): Promise<Reservation[]>;
    updateRoomStatus(roomReservationId: number, status: ReservationRoomStatus, adminComment?: string): Promise<ReservationRoom>;
    cancelReservation(reservationId: number, reason: string): Promise<Reservation>;
    private computeGlobalStatus;
}
//# sourceMappingURL=reservation-admin.service.d.ts.map