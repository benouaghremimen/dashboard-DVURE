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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_room_entity_1 = require("../reservations/reservation-room.entity");
const room_entity_1 = require("../rooms/room.entity");
let CalendarService = class CalendarService {
    constructor(reservationRoomRepository, roomRepository) {
        this.reservationRoomRepository = reservationRoomRepository;
        this.roomRepository = roomRepository;
    }
    async getCalendar(start, end) {
        // Query occupied slots within the range
        // Looking for overlap: start_datetime < end AND end_datetime > start
        const occupied = await this.reservationRoomRepository
            .createQueryBuilder('rr')
            .leftJoinAndSelect('rr.reservation', 'reservation')
            .leftJoinAndSelect('rr.room', 'room')
            .where('rr.start_datetime < :end', { end })
            .andWhere('rr.end_datetime > :start', { start })
            .andWhere('rr.status = :status', { status: reservation_room_entity_1.ReservationRoomStatus.APPROVED })
            .getMany();
        // Map occupied slots to CalendarSlotDto
        const occupiedSlots = occupied.map(occ => {
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
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_room_entity_1.ReservationRoom)),
    __param(1, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map