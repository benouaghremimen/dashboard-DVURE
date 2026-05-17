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
exports.Reservation = exports.ReservationGlobalStatus = exports.ReservationType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const reservation_room_entity_1 = require("./reservation-room.entity");
var ReservationType;
(function (ReservationType) {
    ReservationType["ANNUELLE"] = "ANNUELLE";
    ReservationType["HEBDO"] = "HEBDO";
    ReservationType["UNIQUE"] = "UNIQUE";
})(ReservationType || (exports.ReservationType = ReservationType = {}));
var ReservationGlobalStatus;
(function (ReservationGlobalStatus) {
    ReservationGlobalStatus["PENDING"] = "PENDING";
    ReservationGlobalStatus["PARTIAL"] = "PARTIAL";
    ReservationGlobalStatus["APPROVED"] = "APPROVED";
    ReservationGlobalStatus["REJECTED"] = "REJECTED";
    ReservationGlobalStatus["CANCELLED"] = "CANCELLED";
})(ReservationGlobalStatus || (exports.ReservationGlobalStatus = ReservationGlobalStatus = {}));
let Reservation = class Reservation {
};
exports.Reservation = Reservation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reservation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.reservations, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Reservation.prototype, "club", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reservation.prototype, "event_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reservation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReservationType,
    }),
    __metadata("design:type", String)
], Reservation.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReservationGlobalStatus,
        default: ReservationGlobalStatus.PENDING,
    }),
    __metadata("design:type", String)
], Reservation.prototype, "global_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Reservation.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reservation.prototype, "cancellation_reason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Reservation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reservation_room_entity_1.ReservationRoom, (reservationRoom) => reservationRoom.reservation),
    __metadata("design:type", Array)
], Reservation.prototype, "reservationRooms", void 0);
exports.Reservation = Reservation = __decorate([
    (0, typeorm_1.Entity)()
], Reservation);
//# sourceMappingURL=reservation.entity.js.map