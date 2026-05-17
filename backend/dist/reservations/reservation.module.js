"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reservation_entity_1 = require("./reservation.entity");
const reservation_room_entity_1 = require("./reservation-room.entity");
const reservation_service_1 = require("./reservation.service");
const reservation_admin_service_1 = require("./reservation-admin.service");
const reservation_controller_1 = require("./reservation.controller");
const reservation_admin_controller_1 = require("./reservation-admin.controller");
const conflict_service_1 = require("./conflict.service");
const room_entity_1 = require("../rooms/room.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let ReservationModule = class ReservationModule {
};
exports.ReservationModule = ReservationModule;
exports.ReservationModule = ReservationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([reservation_entity_1.Reservation, reservation_room_entity_1.ReservationRoom, room_entity_1.Room]),
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            reservation_service_1.ReservationService,
            reservation_admin_service_1.ReservationAdminService,
            conflict_service_1.ConflictService,
        ],
        controllers: [
            reservation_controller_1.ReservationController,
            reservation_admin_controller_1.ReservationAdminController,
        ],
        exports: [reservation_service_1.ReservationService],
    })
], ReservationModule);
//# sourceMappingURL=reservation.module.js.map