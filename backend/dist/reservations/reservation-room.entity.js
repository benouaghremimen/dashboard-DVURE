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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationRoom = exports.ReservationRoomStatus = void 0;
const typeorm_1 = require("typeorm");
const reservation_entity_1 = require("./reservation.entity");
const room_entity_1 = require("../rooms/room.entity");
var ReservationRoomStatus;
(function (ReservationRoomStatus) {
    ReservationRoomStatus["PENDING"] = "PENDING";
    ReservationRoomStatus["APPROVED"] = "APPROVED";
    ReservationRoomStatus["REJECTED"] = "REJECTED";
})(ReservationRoomStatus || (exports.ReservationRoomStatus = ReservationRoomStatus = {}));
let ReservationRoom = class ReservationRoom {
    getOccupiedSlots(start, end) {
        throw new Error('Method not implemented.');
    }
};
exports.ReservationRoom = ReservationRoom;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ReservationRoom.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reservation_entity_1.Reservation, (reservation) => reservation.reservationRooms, { onDelete: 'CASCADE' }),
    __metadata("design:type", reservation_entity_1.Reservation)
], ReservationRoom.prototype, "reservation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room, (room) => room.reservationRooms),
    __metadata("design:type", room_entity_1.Room)
], ReservationRoom.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ReservationRoom.prototype, "start_datetime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ReservationRoom.prototype, "end_datetime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReservationRoomStatus,
        default: ReservationRoomStatus.PENDING,
    }),
    __metadata("design:type", String)
], ReservationRoom.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReservationRoom.prototype, "admin_comment", void 0);
exports.ReservationRoom = ReservationRoom = __decorate([
    (0, typeorm_1.Entity)()
], ReservationRoom);
//# sourceMappingURL=reservation-room.entity.js.map