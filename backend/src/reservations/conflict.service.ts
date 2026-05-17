// src/reservations/conflict.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ReservationRoom, ReservationRoomStatus } from '../reservations/reservation-room.entity';


@Injectable()
export class ConflictService {
    constructor(
        @InjectRepository(ReservationRoom)
        private readonly reservationRoomRepo: Repository<ReservationRoom>,
    ) { }

    async checkForConflict(
        roomId: number,
        start: Date,
        end: Date,
    ): Promise<boolean> {
        const conflict = await this.reservationRoomRepo
            .createQueryBuilder('rr')
            .leftJoin('rr.room', 'room')
            .where('room.id = :roomId', { roomId })
            .andWhere('rr.status != :rejected', {
                rejected: ReservationRoomStatus.REJECTED,
            })
            .andWhere(
                // overlap condition
                ':start < rr.end_datetime AND :end > rr.start_datetime',
                { start, end },
            )
            .getOne();

        return !!conflict;
    }
}
