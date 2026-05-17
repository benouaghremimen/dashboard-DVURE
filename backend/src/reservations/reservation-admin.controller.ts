import {
    Controller,
    Get,
    Patch,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationAdminService } from './reservation-admin.service';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/reservations')
export class ReservationAdminController {
    constructor(
        private readonly adminService: ReservationAdminService,
    ) { }

    @Get()
    findAll() {
        return this.adminService.findAll();
    }

    @Patch('room-status')
    updateRoomStatus(@Body() dto: UpdateRoomStatusDto) {
        return this.adminService.updateRoomStatus(
            dto.roomReservationId,
            dto.status,
            dto.adminComment,
        );
    }

    @Patch(':id/cancel')
    cancelReservation(
        @Param('id') id: string,
        @Body() dto: CancelReservationDto,
    ) {
        return this.adminService.cancelReservation(+id, dto.reason);
    }
}
