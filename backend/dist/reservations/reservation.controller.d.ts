import { ReservationService } from './reservation.service';
import { Reservation } from './reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationController {
    private readonly reservationService;
    constructor(reservationService: ReservationService);
    findAll(req: any): Promise<Reservation[]>;
    findOne(id: string): Promise<Reservation>;
    create(createReservationDto: CreateReservationDto, req: any): Promise<Reservation>;
    update(id: string, dto: CreateReservationDto, req: any): Promise<Reservation>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
    cancel(id: string, body: {
        reason?: string;
    }, req: any): Promise<Reservation>;
}
//# sourceMappingURL=reservation.controller.d.ts.map