import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateRoomDto {
    @IsString()
    name!: string;

    @IsNumber()
    capacity!: number;

    @IsOptional()
    @IsBoolean()
    isEnabled?: boolean;

    @IsOptional()
    @IsDateString()
    disabledFrom?: string;

    @IsOptional()
    @IsDateString()
    disabledTo?: string;
}
