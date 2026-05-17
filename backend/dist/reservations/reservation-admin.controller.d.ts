import { ReservationAdminService } from './reservation-admin.service';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
export declare class ReservationAdminController {
    private readonly adminService;
    constructor(adminService: ReservationAdminService);
    findAll(): Promise<import("./reservation.entity").Reservation[]>;
    updateRoomStatus(dto: UpdateRoomStatusDto): Promise<import("./reservation-room.entity").ReservationRoom>;
    cancelReservation(id: string, dto: CancelReservationDto): Promise<import("./reservation.entity").Reservation>;
}
//# sourceMappingURL=reservation-admin.controller.d.ts.map