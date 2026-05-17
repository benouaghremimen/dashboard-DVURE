import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ReservationRoom } from '../reservations/reservation-room.entity';
export declare class RoomService {
    private roomRepo;
    private reservationRoomRepo;
    constructor(roomRepo: Repository<Room>, reservationRoomRepo: Repository<ReservationRoom>);
    create(dto: CreateRoomDto): Promise<Room>;
    update(id: number, dto: UpdateRoomDto): Promise<Room | null>;
    toggle(id: number): Promise<Room>;
    findAll(): Promise<Room[]>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    getAvailableRooms(start: Date, end: Date): Promise<Room[]>;
    private ensureValidDisablePeriod;
    private isTemporarilyDisabled;
}
//# sourceMappingURL=room.service.d.ts.map