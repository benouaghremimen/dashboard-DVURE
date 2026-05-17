import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ReservationRoom, ReservationRoomStatus } from '../reservations/reservation-room.entity';

@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(Room)
        private roomRepo: Repository<Room>,
        @InjectRepository(ReservationRoom)
        private reservationRoomRepo: Repository<ReservationRoom>,
    ) { }

    // CRUD
    async create(dto: CreateRoomDto) {
        this.ensureValidDisablePeriod(dto);
        return this.roomRepo.save(this.roomRepo.create(dto));
    }

    async update(id: number, dto: UpdateRoomDto) {
        this.ensureValidDisablePeriod(dto);
        await this.roomRepo.update(id, dto);
        return this.roomRepo.findOneBy({ id });
    }

    async toggle(id: number) {
        const room = await this.roomRepo.findOneBy({ id });
        if (!room) throw new NotFoundException('Room not found');
        room.isEnabled = !room.isEnabled;
        return this.roomRepo.save(room);
    }

    findAll() {
        return this.roomRepo.find();
    }

    async remove(id: number) {
        const room = await this.roomRepo.findOneBy({ id });
        if (!room) throw new NotFoundException('Room not found');
        await this.roomRepo.remove(room);
        return { success: true };
    }

    // 🔥 DISPONIBILITÉ TEMPORELLE
    async getAvailableRooms(start: Date, end: Date) {
        const rooms = await this.roomRepo.find({
            where: { isEnabled: true },
        });

        // Subquery or join to find occupied rooms
        const conflicts = await this.reservationRoomRepo
            .createQueryBuilder('rr')
            .select('rr.roomId')
            .where('rr.status != :rejected', { rejected: ReservationRoomStatus.REJECTED })
            .andWhere(':start < rr.end_datetime AND :end > rr.start_datetime', { start, end })
            .getRawMany();

        const occupiedRoomIds = conflicts.map(c => c.rr_roomId);

        return rooms.filter((room) => {
            if (occupiedRoomIds.includes(room.id)) {
                return false;
            }
            return !this.isTemporarilyDisabled(room, start, end);
        });
    }

    private ensureValidDisablePeriod(dto: { disabledFrom?: string | Date | null; disabledTo?: string | Date | null }) {
        const hasFrom = dto.disabledFrom !== undefined && dto.disabledFrom !== null && dto.disabledFrom !== '';
        const hasTo = dto.disabledTo !== undefined && dto.disabledTo !== null && dto.disabledTo !== '';

        if (hasFrom !== hasTo) {
            throw new BadRequestException('Disable period requires both start and end dates.');
        }

        if (!hasFrom || !hasTo) {
            return;
        }

        const from = new Date(dto.disabledFrom as string | Date);
        const to = new Date(dto.disabledTo as string | Date);

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            throw new BadRequestException('Invalid disable period dates.');
        }

        if (from >= to) {
            throw new BadRequestException('Disable period start must be before end.');
        }
    }

    private isTemporarilyDisabled(room: Room, start: Date, end: Date): boolean {
        if (!room.disabledFrom || !room.disabledTo) {
            return false;
        }
        const disabledFrom = new Date(room.disabledFrom);
        const disabledTo = new Date(room.disabledTo);
        return start < disabledTo && end > disabledFrom;
    }
}
