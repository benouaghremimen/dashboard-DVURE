import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { ReservationRoom } from './reservation-room.entity';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';
import { ConflictService } from './conflict.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReservationService {
    private readonly reservationRepository;
    private readonly reservationRoomRepository;
    private readonly roomRepository;
    private readonly conflictService;
    private readonly notificationsService;
    constructor(reservationRepository: Repository<Reservation>, reservationRoomRepository: Repository<ReservationRoom>, roomRepository: Repository<Room>, conflictService: ConflictService, notificationsService: NotificationsService);
    create(data: CreateReservationDto, club: User): Promise<Reservation>;
    findAll(): Promise<Reservation[]>;
    findAllForUser(user: {
        id: number;
        role: 'ADMIN' | 'CLUB';
    }): Promise<Reservation[]>;
    findOne(id: number): Promise<Reservation>;
    update(id: number, data: CreateReservationDto, user: {
        id: number;
        role: 'ADMIN' | 'CLUB';
    }): Promise<Reservation>;
    remove(id: number, user: {
        id: number;
        role: 'ADMIN' | 'CLUB';
    }): Promise<void>;
    cancelByClub(id: number, user: {
        id: number;
        role: 'ADMIN' | 'CLUB';
    }, reason?: string): Promise<Reservation>;
    private ensureCanModify;
    private ensureRoomAvailable;
    private isTemporarilyDisabled;
    private computeGlobalStatus;
}
//# sourceMappingURL=reservation.service.d.ts.map