import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    Put,
    Delete,
    Patch,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from './reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // I should verify if this exists

@Controller('reservations')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Request() req: any): Promise<Reservation[]> {
        return this.reservationService.findAllForUser(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Reservation> {
        return this.reservationService.findOne(+id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createReservationDto: CreateReservationDto, @Request() req: any) {
        return this.reservationService.create(createReservationDto, req.user);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id') id: string,
        @Body() dto: CreateReservationDto,
        @Request() req: any,
    ) {
        return this.reservationService.update(+id, dto, req.user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Request() req: any) {
        await this.reservationService.remove(+id, req.user);
        return { success: true };
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancel(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
        return this.reservationService.cancelByClub(+id, req.user, body?.reason);
    }
}
