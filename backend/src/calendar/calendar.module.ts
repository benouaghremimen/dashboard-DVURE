import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { ReservationRoom } from '../reservations/reservation-room.entity';
import { Room } from '../rooms/room.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReservationRoom, Room]),
    ],
    controllers: [CalendarController],
    providers: [CalendarService],
    exports: [CalendarService],
})
export class CalendarModule { }
