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
exports.ReservationAdminController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const reservation_admin_service_1 = require("./reservation-admin.service");
const update_room_status_dto_1 = require("./dto/update-room-status.dto");
const cancel_reservation_dto_1 = require("./dto/cancel-reservation.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let ReservationAdminController = class ReservationAdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    findAll() {
        return this.adminService.findAll();
    }
    updateRoomStatus(dto) {
        return this.adminService.updateRoomStatus(dto.roomReservationId, dto.status, dto.adminComment);
    }
    cancelReservation(id, dto) {
        return this.adminService.cancelReservation(+id, dto.reason);
    }
};
exports.ReservationAdminController = ReservationAdminController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReservationAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('room-status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_room_status_dto_1.UpdateRoomStatusDto]),
    __metadata("design:returntype", void 0)
], ReservationAdminController.prototype, "updateRoomStatus", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_reservation_dto_1.CancelReservationDto]),
    __metadata("design:returntype", void 0)
], ReservationAdminController.prototype, "cancelReservation", null);
exports.ReservationAdminController = ReservationAdminController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Controller)('admin/reservations'),
    __metadata("design:paramtypes", [reservation_admin_service_1.ReservationAdminService])
], ReservationAdminController);
//# sourceMappingURL=reservation-admin.controller.js.map