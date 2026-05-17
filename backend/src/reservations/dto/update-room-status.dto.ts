import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ReservationRoomStatus } from '../reservation-room.entity';

export class UpdateRoomStatusDto {
    @IsInt()
    roomReservationId!: number;

    @IsEnum(ReservationRoomStatus)
    status!: ReservationRoomStatus;

    @IsOptional()
    @IsString()
    adminComment?: string;
}
