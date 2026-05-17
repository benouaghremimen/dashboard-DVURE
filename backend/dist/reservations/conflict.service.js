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
exports.ConflictService = void 0;
// src/reservations/conflict.service.ts
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_room_entity_1 = require("../reservations/reservation-room.entity");
let ConflictService = class ConflictService {
    constructor(reservationRoomRepo) {
        this.reservationRoomRepo = reservationRoomRepo;
    }
    async checkForConflict(roomId, start, end) {
        const conflict = await this.reservationRoomRepo
            .createQueryBuilder('rr')
            .leftJoin('rr.room', 'room')
            .where('room.id = :roomId', { roomId })
            .andWhere('rr.status != :rejected', {
            rejected: reservation_room_entity_1.ReservationRoomStatus.REJECTED,
        })
            .andWhere(
        // overlap condition
        ':start < rr.end_datetime AND :end > rr.start_datetime', { start, end })
            .getOne();
        return !!conflict;
    }
};
exports.ConflictService = ConflictService;
exports.ConflictService = ConflictService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_room_entity_1.ReservationRoom)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConflictService);
//# sourceMappingURL=conflict.service.js.map