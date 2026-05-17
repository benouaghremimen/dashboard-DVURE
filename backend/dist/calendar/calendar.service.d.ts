import { Repository } from 'typeorm';
import { ReservationRoom } from '../reservations/reservation-room.entity';
import { Room } from '../rooms/room.entity';
import { CalendarSlotDto } from './calendar.dto';
export declare class CalendarService {
    private readonly reservationRoomRepository;
    private readonly roomRepository;
    constructor(reservationRoomRepository: Repository<ReservationRoom>, roomRepository: Repository<Room>);
    getCalendar(start: Date, end: Date): Promise<CalendarSlotDto[]>;
}
//# sourceMappingURL=calendar.service.d.ts.map