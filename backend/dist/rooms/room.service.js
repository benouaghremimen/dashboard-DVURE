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
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const room_entity_1 = require("./room.entity");
const reservation_room_entity_1 = require("../reservations/reservation-room.entity");
let RoomService = class RoomService {
    constructor(roomRepo, reservationRoomRepo) {
        this.roomRepo = roomRepo;
        this.reservationRoomRepo = reservationRoomRepo;
    }
    // CRUD
    async create(dto) {
        this.ensureValidDisablePeriod(dto);
        return this.roomRepo.save(this.roomRepo.create(dto));
    }
    async update(id, dto) {
        this.ensureValidDisablePeriod(dto);
        await this.roomRepo.update(id, dto);
        return this.roomRepo.findOneBy({ id });
    }
    async toggle(id) {
        const room = await this.roomRepo.findOneBy({ id });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        room.isEnabled = !room.isEnabled;
        return this.roomRepo.save(room);
    }
    findAll() {
        return this.roomRepo.find();
    }
    async remove(id) {
        const room = await this.roomRepo.findOneBy({ id });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        await this.roomRepo.remove(room);
        return { success: true };
    }
    // 🔥 DISPONIBILITÉ TEMPORELLE
    async getAvailableRooms(start, end) {
        const rooms = await this.roomRepo.find({
            where: { isEnabled: true },
        });
        // Subquery or join to find occupied rooms
        const conflicts = await this.reservationRoomRepo
            .createQueryBuilder('rr')
            .select('rr.roomId')
            .where('rr.status != :rejected', { rejected: reservation_room_entity_1.ReservationRoomStatus.REJECTED })
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
    ensureValidDisablePeriod(dto) {
        const hasFrom = dto.disabledFrom !== undefined && dto.disabledFrom !== null && dto.disabledFrom !== '';
        const hasTo = dto.disabledTo !== undefined && dto.disabledTo !== null && dto.disabledTo !== '';
        if (hasFrom !== hasTo) {
            throw new common_1.BadRequestException('Disable period requires both start and end dates.');
        }
        if (!hasFrom || !hasTo) {
            return;
        }
        const from = new Date(dto.disabledFrom);
        const to = new Date(dto.disabledTo);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            throw new common_1.BadRequestException('Invalid disable period dates.');
        }
        if (from >= to) {
            throw new common_1.BadRequestException('Disable period start must be before end.');
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
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_room_entity_1.ReservationRoom)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RoomService);
//# sourceMappingURL=room.service.js.map