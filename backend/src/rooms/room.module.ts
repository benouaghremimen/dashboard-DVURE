import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { ReservationRoom } from '../reservations/reservation-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, ReservationRoom])],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule { }
