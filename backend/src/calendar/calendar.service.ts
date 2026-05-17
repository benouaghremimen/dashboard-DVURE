import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationRoom, ReservationRoomStatus } from '../reservations/reservation-room.entity';
import { Room } from '../rooms/room.entity';
import { CalendarSlotDto } from './calendar.dto';

@Injectable()
export class CalendarService {
    constructor(
        @InjectRepository(ReservationRoom)
        private readonly reservationRoomRepository: Repository<ReservationRoom>,
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
    ) { }

    async getCalendar(start: Date, end: Date): Promise<CalendarSlotDto[]> {
        // Query occupied slots within the range
        // Looking for overlap: start_datetime < end AND end_datetime > start
        const occupied = await this.reservationRoomRepository
            .createQueryBuilder('rr')
            .leftJoinAndSelect('rr.reservation', 'reservation')
            .leftJoinAndSelect('rr.room', 'room')
            .where('rr.start_datetime < :end', { end })
            .andWhere('rr.end_datetime > :start', { start })
            .andWhere('rr.status = :status', { status: ReservationRoomStatus.APPROVED })
            .getMany();

        // Map occupied slots to CalendarSlotDto
        const occupiedSlots: CalendarSlotDto[] = occupied.map(occ => {
            return {
                roomId: occ.room.id,
                roomName: occ.room.name,
                start: occ.start_datetime,
                end: occ.end_datetime,
                available: false,
                title: occ.reservation?.event_name || 'Booked'
            };
        });

        return occupiedSlots;
    }
}
