import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationGlobalStatus, ReservationType } from './reservation.entity';
import { ReservationRoom, ReservationRoomStatus } from './reservation-room.entity';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';
import { ConflictService } from './conflict.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepository: Repository<Reservation>,
        @InjectRepository(ReservationRoom)
        private readonly reservationRoomRepository: Repository<ReservationRoom>,
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
        private readonly conflictService: ConflictService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(data: CreateReservationDto, club: User): Promise<Reservation> {
        const resolvedRooms: { room: Room; start: Date; end: Date }[] = [];

        // Resolve rooms and check for conflicts
        if (data.rooms && data.rooms.length > 0) {
            for (const r of data.rooms) {
                const room = await this.roomRepository.findOne({ where: { id: r.roomId } });
                if (!room) {
                    throw new NotFoundException(`Room with ID ${r.roomId} not found`);
                }

                const start = new Date(r.startTime);
                const end = new Date(r.endTime);

                this.ensureRoomAvailable(room, start, end);

                const hasConflict = await this.conflictService.checkForConflict(
                    room.id,
                    start,
                    end,
                );
                if (hasConflict) {
                    throw new ConflictException(
                        `Room ${room.name} is already booked for the selected time range.`,
                    );
                }
                resolvedRooms.push({ room, start, end });
            }
        }

        const reservation = this.reservationRepository.create({
            club: club,
            event_name: data.event_name,
            description: data.description,
            type: data.type,
            global_status: ReservationGlobalStatus.PENDING,
        });

        const savedReservation = await this.reservationRepository.save(reservation);

        if (resolvedRooms.length > 0) {
            const roomsToSave = resolvedRooms.map((r) =>
                this.reservationRoomRepository.create({
                    reservation: savedReservation,
                    room: r.room,
                    start_datetime: r.start,
                    end_datetime: r.end,
                    status: ReservationRoomStatus.PENDING,
                }),
            );
            await this.reservationRoomRepository.save(roomsToSave);
            savedReservation.reservationRooms = roomsToSave;
        }

        return savedReservation;
    }

    async findAll(): Promise<Reservation[]> {
        const reservations = await this.reservationRepository.find({
            relations: ['reservationRooms', 'club', 'reservationRooms.room'],
        });
        return reservations.map((reservation) => {
            if (reservation.cancelled_at) {
                reservation.global_status = ReservationGlobalStatus.CANCELLED;
                return reservation;
            }
            reservation.global_status = this.computeGlobalStatus(
                reservation.reservationRooms || [],
            );
            return reservation;
        });
    }

    async findAllForUser(user: { id: number; role: 'ADMIN' | 'CLUB' }) {
        if (user.role === 'ADMIN') {
            return this.findAll();
        }

        const reservations = await this.reservationRepository.find({
            where: { club: { id: user.id } },
            relations: ['reservationRooms', 'club', 'reservationRooms.room'],
        });
        return reservations.map((reservation) => {
            if (reservation.cancelled_at) {
                reservation.global_status = ReservationGlobalStatus.CANCELLED;
                return reservation;
            }
            reservation.global_status = this.computeGlobalStatus(
                reservation.reservationRooms || [],
            );
            return reservation;
        });
    }

    async findOne(id: number): Promise<Reservation> {
        const reservation = await this.reservationRepository.findOne({
            where: { id },
            relations: ['reservationRooms', 'club', 'reservationRooms.room'],
        });
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }
        if (reservation.cancelled_at) {
            reservation.global_status = ReservationGlobalStatus.CANCELLED;
            return reservation;
        }
        reservation.global_status = this.computeGlobalStatus(
            reservation.reservationRooms || [],
        );
        return reservation;
    }

    async update(
        id: number,
        data: CreateReservationDto,
        user: { id: number; role: 'ADMIN' | 'CLUB' },
    ): Promise<Reservation> {
        const existing = await this.findOne(id);
        this.ensureCanModify(existing, user);

        existing.event_name = data.event_name;
        existing.description = data.description;
        existing.type = data.type;
        existing.global_status = ReservationGlobalStatus.PENDING;

        await this.reservationRoomRepository
            .createQueryBuilder()
            .delete()
            .from(ReservationRoom)
            .where('reservationId = :id', { id: existing.id })
            .execute();

        const resolvedRooms: { room: Room; start: Date; end: Date }[] = [];
        for (const r of data.rooms) {
            const room = await this.roomRepository.findOne({ where: { id: r.roomId } });
            if (!room) {
                throw new NotFoundException(`Room with ID ${r.roomId} not found`);
            }

            const start = new Date(r.startTime);
            const end = new Date(r.endTime);

            this.ensureRoomAvailable(room, start, end);

            const hasConflict = await this.conflictService.checkForConflict(
                room.id,
                start,
                end,
            );

            if (hasConflict) {
                throw new ConflictException(
                    `Room ${room.name} is already booked for the selected time range.`,
                );
            }

            resolvedRooms.push({ room, start, end });
        }

        const savedReservation = await this.reservationRepository.save(existing);

        if (resolvedRooms.length > 0) {
            const roomsToSave = resolvedRooms.map((r) =>
                this.reservationRoomRepository.create({
                    reservation: savedReservation,
                    room: r.room,
                    start_datetime: r.start,
                    end_datetime: r.end,
                    status: ReservationRoomStatus.PENDING,
                }),
            );
            await this.reservationRoomRepository.save(roomsToSave);
        }

        return this.findOne(id);
    }

    async remove(
        id: number,
        user: { id: number; role: 'ADMIN' | 'CLUB' },
    ): Promise<void> {
        const reservation = await this.findOne(id);
        this.ensureCanModify(reservation, user);
        await this.reservationRepository.delete(id);
    }

    async cancelByClub(
        id: number,
        user: { id: number; role: 'ADMIN' | 'CLUB' },
        reason?: string,
    ): Promise<Reservation> {
        const reservation = await this.findOne(id);
        this.ensureCanModify(reservation, user);

        if (reservation.cancelled_at) {
            return reservation;
        }

        reservation.global_status = ReservationGlobalStatus.CANCELLED;
        reservation.cancelled_at = new Date();
        reservation.cancellation_reason = reason?.trim() || 'Annulation par le club';

        if (reservation.reservationRooms?.length) {
            for (const room of reservation.reservationRooms) {
                room.status = ReservationRoomStatus.REJECTED;
                room.admin_comment = reservation.cancellation_reason;
            }
            await this.reservationRoomRepository.save(reservation.reservationRooms);
        }

        await this.reservationRepository.save(reservation);

        return reservation;
    }

    private ensureCanModify(
        reservation: Reservation,
        user: { id: number; role: 'ADMIN' | 'CLUB' },
    ) {
        if (user.role === 'ADMIN') {
            return;
        }

        if (reservation.club?.id !== user.id) {
            throw new ForbiddenException('Not authorized to modify this reservation');
        }
    }

    private ensureRoomAvailable(room: Room, start: Date, end: Date) {
        if (!room.isEnabled) {
            throw new ConflictException(
                `Salle ${room.name} est désactivée par l'administration.`,
            );
        }

        if (this.isTemporarilyDisabled(room, start, end)) {
            throw new ConflictException(
                `Salle ${room.name} est indisponible sur la période choisie (désactivée par l'administration).`,
            );
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

    private computeGlobalStatus(rooms: ReservationRoom[]): ReservationGlobalStatus {
        if (rooms.length === 0) {
            return ReservationGlobalStatus.PENDING;
        }

        const allApproved = rooms.every(r => r.status === ReservationRoomStatus.APPROVED);
        const allRejected = rooms.every(r => r.status === ReservationRoomStatus.REJECTED);
        const hasApproved = rooms.some(r => r.status === ReservationRoomStatus.APPROVED);
        const hasRejected = rooms.some(r => r.status === ReservationRoomStatus.REJECTED);

        if (allApproved) {
            return ReservationGlobalStatus.APPROVED;
        }
        if (allRejected) {
            return ReservationGlobalStatus.REJECTED;
        }
        if (hasApproved && hasRejected) {
            return ReservationGlobalStatus.PARTIAL;
        }
        return ReservationGlobalStatus.PENDING;
    }
}

