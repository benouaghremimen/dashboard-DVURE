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
exports.ReservationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_entity_1 = require("./reservation.entity");
const reservation_room_entity_1 = require("./reservation-room.entity");
const room_entity_1 = require("../rooms/room.entity");
const conflict_service_1 = require("./conflict.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ReservationService = class ReservationService {
    constructor(reservationRepository, reservationRoomRepository, roomRepository, conflictService, notificationsService) {
        this.reservationRepository = reservationRepository;
        this.reservationRoomRepository = reservationRoomRepository;
        this.roomRepository = roomRepository;
        this.conflictService = conflictService;
        this.notificationsService = notificationsService;
    }
    async create(data, club) {
        const resolvedRooms = [];
        // Resolve rooms and check for conflicts
        if (data.rooms && data.rooms.length > 0) {
            for (const r of data.rooms) {
                const room = await this.roomRepository.findOne({ where: { id: r.roomId } });
                if (!room) {
                    throw new common_1.NotFoundException(`Room with ID ${r.roomId} not found`);
                }
                const start = new Date(r.startTime);
                const end = new Date(r.endTime);
                this.ensureRoomAvailable(room, start, end);
                const hasConflict = await this.conflictService.checkForConflict(room.id, start, end);
                if (hasConflict) {
                    throw new common_1.ConflictException(`Room ${room.name} is already booked for the selected time range.`);
                }
                resolvedRooms.push({ room, start, end });
            }
        }
        const reservation = this.reservationRepository.create({
            club: club,
            event_name: data.event_name,
            description: data.description,
            type: data.type,
            global_status: reservation_entity_1.ReservationGlobalStatus.PENDING,
        });
        const savedReservation = await this.reservationRepository.save(reservation);
        if (resolvedRooms.length > 0) {
            const roomsToSave = resolvedRooms.map((r) => this.reservationRoomRepository.create({
                reservation: savedReservation,
                room: r.room,
                start_datetime: r.start,
                end_datetime: r.end,
                status: reservation_room_entity_1.ReservationRoomStatus.PENDING,
            }));
            await this.reservationRoomRepository.save(roomsToSave);
            savedReservation.reservationRooms = roomsToSave;
        }
        return savedReservation;
    }
    async findAll() {
        const reservations = await this.reservationRepository.find({
            relations: ['reservationRooms', 'club', 'reservationRooms.room'],
        });
        return reservations.map((reservation) => {
            if (reservation.cancelled_at) {
                reservation.global_status = reservation_entity_1.ReservationGlobalStatus.CANCELLED;
                return reservation;
            }
            reservation.global_status = this.computeGlobalStatus(reservation.reservationRooms || []);
            return reservation;
        });
    }
    async findAllForUser(user) {
        if (user.role === 'ADMIN') {
            return this.findAll();
        }
        const reservations = await this.reservationRepository.find({
            where: { club: { id: user.id } },
            relations: ['reservationRooms', 'club', 'reservationRooms.room'],
        });
        return reservations.map((reservation) => {
            if (reservation.cancelled_at) {
                reservation.global_status = reservation_entity_1.ReservationGlobalStatus.CANCELLED;
                return reservation;
            }
            reservation.global_status = this.computeGlobalStatus(reservation.reservationRooms || []);
            return reservation;
        });
    }
    async findOne(id) {
        const reservation = await this.reservationRepository.findOne({
            where: { id },
            relations: ['reservationRooms', 'club', 'reservationRooms.room'],
        });
        if (!reservation) {
            throw new common_1.NotFoundException(`Reservation with ID ${id} not found`);
        }
        if (reservation.cancelled_at) {
            reservation.global_status = reservation_entity_1.ReservationGlobalStatus.CANCELLED;
            return reservation;
        }
        reservation.global_status = this.computeGlobalStatus(reservation.reservationRooms || []);
        return reservation;
    }
    async update(id, data, user) {
        const existing = await this.findOne(id);
        this.ensureCanModify(existing, user);
        existing.event_name = data.event_name;
        existing.description = data.description;
        existing.type = data.type;
        existing.global_status = reservation_entity_1.ReservationGlobalStatus.PENDING;
        await this.reservationRoomRepository
            .createQueryBuilder()
            .delete()
            .from(reservation_room_entity_1.ReservationRoom)
            .where('reservationId = :id', { id: existing.id })
            .execute();
        const resolvedRooms = [];
        for (const r of data.rooms) {
            const room = await this.roomRepository.findOne({ where: { id: r.roomId } });
            if (!room) {
                throw new common_1.NotFoundException(`Room with ID ${r.roomId} not found`);
            }
            const start = new Date(r.startTime);
            const end = new Date(r.endTime);
            this.ensureRoomAvailable(room, start, end);
            const hasConflict = await this.conflictService.checkForConflict(room.id, start, end);
            if (hasConflict) {
                throw new common_1.ConflictException(`Room ${room.name} is already booked for the selected time range.`);
            }
            resolvedRooms.push({ room, start, end });
        }
        const savedReservation = await this.reservationRepository.save(existing);
        if (resolvedRooms.length > 0) {
            const roomsToSave = resolvedRooms.map((r) => this.reservationRoomRepository.create({
                reservation: savedReservation,
                room: r.room,
                start_datetime: r.start,
                end_datetime: r.end,
                status: reservation_room_entity_1.ReservationRoomStatus.PENDING,
            }));
            await this.reservationRoomRepository.save(roomsToSave);
        }
        return this.findOne(id);
    }
    async remove(id, user) {
        const reservation = await this.findOne(id);
        this.ensureCanModify(reservation, user);
        await this.reservationRepository.delete(id);
    }
    async cancelByClub(id, user, reason) {
        const reservation = await this.findOne(id);
        this.ensureCanModify(reservation, user);
        if (reservation.cancelled_at) {
            return reservation;
        }
        reservation.global_status = reservation_entity_1.ReservationGlobalStatus.CANCELLED;
        reservation.cancelled_at = new Date();
        reservation.cancellation_reason = reason?.trim() || 'Annulation par le club';
        if (reservation.reservationRooms?.length) {
            for (const room of reservation.reservationRooms) {
                room.status = reservation_room_entity_1.ReservationRoomStatus.REJECTED;
                room.admin_comment = reservation.cancellation_reason;
            }
            await this.reservationRoomRepository.save(reservation.reservationRooms);
        }
        await this.reservationRepository.save(reservation);
        return reservation;
    }
    ensureCanModify(reservation, user) {
        if (user.role === 'ADMIN') {
            return;
        }
        if (reservation.club?.id !== user.id) {
            throw new common_1.ForbiddenException('Not authorized to modify this reservation');
        }
    }
    ensureRoomAvailable(room, start, end) {
        if (!room.isEnabled) {
            throw new common_1.ConflictException(`Salle ${room.name} est désactivée par l'administration.`);
        }
        if (this.isTemporarilyDisabled(room, start, end)) {
            throw new common_1.ConflictException(`Salle ${room.name} est indisponible sur la période choisie (désactivée par l'administration).`);
        }
    }
    isTemporarilyDisabled(room, start, end) {
        if (!room.disabledFrom || !room.disabledTo) {
            return false;
        }
        const disabledFrom = new Date(room.disabledFrom);
        const disabledTo = new Date(room.disabledTo);
        return start < disabledTo && end > disabledFrom;
    }
    computeGlobalStatus(rooms) {
        if (rooms.length === 0) {
            return reservation_entity_1.ReservationGlobalStatus.PENDING;
        }
        const allApproved = rooms.every(r => r.status === reservation_room_entity_1.ReservationRoomStatus.APPROVED);
        const allRejected = rooms.every(r => r.status === reservation_room_entity_1.ReservationRoomStatus.REJECTED);
        const hasApproved = rooms.some(r => r.status === reservation_room_entity_1.ReservationRoomStatus.APPROVED);
        const hasRejected = rooms.some(r => r.status === reservation_room_entity_1.ReservationRoomStatus.REJECTED);
        if (allApproved) {
            return reservation_entity_1.ReservationGlobalStatus.APPROVED;
        }
        if (allRejected) {
            return reservation_entity_1.ReservationGlobalStatus.REJECTED;
        }
        if (hasApproved && hasRejected) {
            return reservation_entity_1.ReservationGlobalStatus.PARTIAL;
        }
        return reservation_entity_1.ReservationGlobalStatus.PENDING;
    }
};
exports.ReservationService = ReservationService;
exports.ReservationService = ReservationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_room_entity_1.ReservationRoom)),
    __param(2, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        conflict_service_1.ConflictService,
        notifications_service_1.NotificationsService])
], ReservationService);
//# sourceMappingURL=reservation.service.js.map