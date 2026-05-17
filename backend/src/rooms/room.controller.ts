import {
    Controller,
    Delete,
    Get,
    Post,
    Put,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rooms')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    // ADMIN
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() dto: CreateRoomDto) {
        return this.roomService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
        return this.roomService.update(+id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.roomService.remove(+id);
    }

    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    toggle(@Param('id') id: string) {
        return this.roomService.toggle(+id);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CLUB')
    findAll() {
        return this.roomService.findAll();
    }

    // USER (ADMIN + CLUB)
    @Get('availability')
    @UseGuards(JwtAuthGuard)
    getAvailability(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        return this.roomService.getAvailableRooms(
            new Date(start),
            new Date(end),
        );
    }
}
