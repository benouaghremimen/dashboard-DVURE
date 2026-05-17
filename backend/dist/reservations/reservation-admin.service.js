"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_entity_1 = require("./reservation.entity");
const reservation_room_entity_1 = require("./reservation-room.entity");
const reservation_entity_2 = require("./reservation.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let ReservationAdminService = class ReservationAdminService {
    constructor(reservationRepo, roomRepo, notificationsService) {
        this.reservationRepo = reservationRepo;
        this.roomRepo = roomRepo;
        this.notificationsService = notificationsService;
    }
    async findAll() {
        const reservations = await this.reservationRepo.find({
            relations: ['club', 'reservationRooms', 'reservationRooms.room'],
        });
        return reservations.map((reservation) => {
            if (reservation.cancelled_at) {
                reservation.global_status = reservation_entity_2.ReservationGlobalStatus.CANCELLED;
                return reservation;
            }
            reservation.global_status = this.computeGlobalStatus(reservation.reservationRooms || []);
            return reservation;
        });
    }
    async updateRoomStatus(roomReservationId, status, adminComment) {
        const room = await this.roomRepo.findOne({
            where: { id: roomReservationId },
            relations: ['reservation', 'reservation.club', 'reservation.reservationRooms', 'reservation.reservationRooms.room'],
        });
        if (!room) {
            throw new common_1.NotFoundException('Room reservation not found');
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
        const rooms = (reservation.reservationRooms || []).map((r) => r.id === room.id ? room : r);
        const allApproved = rooms.every(r => r.status === reservation_room_entity_1.ReservationRoomStatus.APPROVED);
        const allRejected = rooms.every(r => r.status === reservation_room_entity_1.ReservationRoomStatus.REJECTED);
        const hasApproved = rooms.some(r => r.status === reservation_room_entity_1.ReservationRoomStatus.APPROVED);
        const hasRejected = rooms.some(r => r.status === reservation_room_entity_1.ReservationRoomStatus.REJECTED);
        if (allApproved) {
            reservation.global_status = reservation_entity_2.ReservationGlobalStatus.APPROVED;
        }
        else if (allRejected) {
            reservation.global_status = reservation_entity_2.ReservationGlobalStatus.REJECTED;
        }
        else if (hasRejected && hasApproved) {
            reservation.global_status = reservation_entity_2.ReservationGlobalStatus.PARTIAL;
        }
        else if (hasRejected) {
            reservation.global_status = reservation_entity_2.ReservationGlobalStatus.PENDING;
        }
        else {
            reservation.global_status = reservation_entity_2.ReservationGlobalStatus.PENDING;
        }
        await this.reservationRepo.save(reservation);
        const allDecided = rooms.every(r => r.status !== reservation_room_entity_1.ReservationRoomStatus.PENDING);
        if (!allDecided) {
            return room;
        }
        if (reservation.global_status === reservation_entity_2.ReservationGlobalStatus.PARTIAL) {
            const approvedRooms = rooms.filter(r => r.status === reservation_room_entity_1.ReservationRoomStatus.APPROVED);
            const rejectedRooms = rooms.filter(r => r.status === reservation_room_entity_1.ReservationRoomStatus.REJECTED);
            await this.notificationsService.notifyReservationPartialDecision(reservation.club, reservation.event_name || 'Réservation', approvedRooms, rejectedRooms);
            return room;
        }
        // Notify user about final status change (APPROVED / REJECTED)
        await this.notificationsService.notifyReservationStatusChange(reservation.club, reservation.global_status, reservation.global_status === reservation_entity_2.ReservationGlobalStatus.REJECTED
            ? room.admin_comment
            : undefined);
        return room;
    }
    async cancelReservation(reservationId, reason) {
        const reservation = await this.reservationRepo.findOne({
            where: { id: reservationId },
            relations: ['club', 'reservationRooms', 'reservationRooms.room'],
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Reservation not found');
        }
        reservation.global_status = reservation_entity_2.ReservationGlobalStatus.CANCELLED;
        reservation.cancelled_at = new Date();
        reservation.cancellation_reason = reason;
        if (reservation.reservationRooms?.length) {
            for (const room of reservation.reservationRooms) {
                room.status = reservation_room_entity_1.ReservationRoomStatus.REJECTED;
                room.admin_comment = reason;
            }
            await this.roomRepo.save(reservation.reservationRooms);
        }
        await this.reservationRepo.save(reservation);
        await this.notificationsService.notifyReservationCancelled(reservation.club, reason);
        return reservation;
    }
    computeGlobalStatus(rooms) {
        if (rooms.length === 0) {
            return reservation_entity_2.ReservationGlobalStatus.PENDING;
        }
        const allApproved = rooms.every(r => r.status === reservation_room_entity_1.ReservationRoomStatus.APPROVED);
        const allRejected = rooms.every(r => r.status === reservation_room_entity_1.ReservationRoomStatus.REJECTED);
        const hasApproved = rooms.some(r => r.status === reservation_room_entity_1.ReservationRoomStatus.APPROVED);
        const hasRejected = rooms.some(r => r.status === reservation_room_entity_1.ReservationRoomStatus.REJECTED);
        if (allApproved) {
            return reservation_entity_2.ReservationGlobalStatus.APPROVED;
        }
        if (allRejected) {
            return reservation_entity_2.ReservationGlobalStatus.REJECTED;
        }
        if (hasApproved && hasRejected) {
            return reservation_entity_2.ReservationGlobalStatus.PARTIAL;
        }
        return reservation_entity_2.ReservationGlobalStatus.PENDING;
    }
};
exports.ReservationAdminService = ReservationAdminService;
exports.ReservationAdminService = ReservationAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_room_entity_1.ReservationRoom)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], ReservationAdminService);
//# sourceMappingURL=reservation-admin.service.js.map