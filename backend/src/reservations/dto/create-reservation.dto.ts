import {
    IsArray,
    IsDateString,
    IsInt,
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationType } from '../reservation.entity';

export class ReservationRoomDto {
    @IsInt()
    roomId!: number;

    @IsDateString()
    startTime!: string;

    @IsDateString()
    endTime!: string;
}

export class CreateReservationDto {
    @IsString()
    @IsNotEmpty()
    event_name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ReservationType)
    type!: ReservationType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReservationRoomDto)
    rooms!: ReservationRoomDto[];
}
