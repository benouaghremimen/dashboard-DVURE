import { Repository } from 'typeorm';
import { ReservationRoom } from '../reservations/reservation-room.entity';
export declare class ConflictService {
    private readonly reservationRoomRepo;
    constructor(reservationRoomRepo: Repository<ReservationRoom>);
    checkForConflict(roomId: number, start: Date, end: Date): Promise<boolean>;
}
//# sourceMappingURL=conflict.service.d.ts.map