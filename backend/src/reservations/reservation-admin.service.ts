import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { ReservationRoom, ReservationRoomStatus } from './reservation-room.entity';
import { ReservationGlobalStatus } from './reservation.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationAdminService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
        @InjectRepository(ReservationRoom)
        private readonly roomRepo: Repository<ReservationRoom>,
        private readonly notificationsService: NotificationsService,
    ) { }

    async findAll() {
        const reservations = await this.reservationRepo.find({
            relations: ['club', 'reservationRooms', 'reservationRooms.room'],
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

    async updateRoomStatus(
        roomReservationId: number,
        status: ReservationRoomStatus,
        adminComment?: string,
    ) {
        const room = await this.roomRepo.findOne({
            where: { id: roomReservationId },
            relations: ['reservation', 'reservation.club', 'reservation.reservationRooms', 'reservation.reservationRooms.room'],
        });

        if (!room) {
            throw new NotFoundException('Room reservation not found');
        }

        const incomingComment = typeof adminComment === 'string' ? adminComment.trim() : undefined;
        const existingComment = typeof room.admin_comment === 'string' ? room.admin_comment.trim() : undefined;
        if (room.status === status && incomingComment === existingComment) {
            return room;
        }

        room.status = status;
        if (typeof adminComment === 'string') {
            const trimmed = adminComment.trim();
            room.admin_comment = trimmed ? trimmed : undefined;
        }
        await this.roomRepo.save(room);

        const reservation = room.reservation;
        if (reservation.cancelled_at) {
            return room;
        }
        const rooms = (reservation.reservationRooms || []).map((r) =>
            r.id === room.id ? room : r,
        );

        const allApproved = rooms.every(r => r.status === ReservationRoomStatus.APPROVED);
        const allRejected = rooms.every(r => r.status === ReservationRoomStatus.REJECTED);
        const hasApproved = rooms.some(r => r.status === ReservationRoomStatus.APPROVED);
        const hasRejected = rooms.some(r => r.status === ReservationRoomStatus.REJECTED);

        if (allApproved) {
            reservation.global_status = ReservationGlobalStatus.APPROVED;
        } else if (allRejected) {
            reservation.global_status = ReservationGlobalStatus.REJECTED;
        } else if (hasRejected && hasApproved) {
            reservation.global_status = ReservationGlobalStatus.PARTIAL;
        } else if (hasRejected) {
            reservation.global_status = ReservationGlobalStatus.PENDING;
        } else {
            reservation.global_status = ReservationGlobalStatus.PENDING;
        }

        await this.reservationRepo.save(reservation);

        const allDecided = rooms.every(r => r.status !== ReservationRoomStatus.PENDING);

        if (!allDecided) {
            return room;
        }

        if (reservation.global_status === ReservationGlobalStatus.PARTIAL) {
            const approvedRooms = rooms.filter(r => r.status === ReservationRoomStatus.APPROVED);
            const rejectedRooms = rooms.filter(r => r.status === ReservationRoomStatus.REJECTED);
            await this.notificationsService.notifyReservationPartialDecision(
                reservation.club,
                reservation.event_name || 'Réservation',
                approvedRooms,
                rejectedRooms,
            );
            return room;
        }

        // Notify user about final status change (APPROVED / REJECTED)
        await this.notificationsService.notifyReservationStatusChange(
            reservation.club,
            reservation.global_status,
            reservation.global_status === ReservationGlobalStatus.REJECTED
                ? room.admin_comment
                : undefined
        );

        return room;
    }

    async cancelReservation(reservationId: number, reason: string) {
        const reservation = await this.reservationRepo.findOne({
            where: { id: reservationId },
            relations: ['club', 'reservationRooms', 'reservationRooms.room'],
        });
        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        reservation.global_status = ReservationGlobalStatus.CANCELLED;
        reservation.cancelled_at = new Date();
        reservation.cancellation_reason = reason;

        if (reservation.reservationRooms?.length) {
            for (const room of reservation.reservationRooms) {
                room.status = ReservationRoomStatus.REJECTED;
                room.admin_comment = reason;
            }
            await this.roomRepo.save(reservation.reservationRooms);
        }

        await this.reservationRepo.save(reservation);

        await this.notificationsService.notifyReservationCancelled(
            reservation.club,
            reason,
        );

        return reservation;
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
