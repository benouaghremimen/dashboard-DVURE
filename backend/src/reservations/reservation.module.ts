import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { ReservationRoom } from './reservation-room.entity';
import { ReservationService } from './reservation.service';
import { ReservationAdminService } from './reservation-admin.service';
import { ReservationController } from './reservation.controller';
import { ReservationAdminController } from './reservation-admin.controller';
import { ConflictService } from './conflict.service';
import { Room } from '../rooms/room.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation, ReservationRoom, Room]),
        NotificationsModule,
    ],
    providers: [
        ReservationService,
        ReservationAdminService,
        ConflictService,
    ],
    controllers: [
        ReservationController,
        ReservationAdminController,
    ],
    exports: [ReservationService],
})
export class ReservationModule { }
