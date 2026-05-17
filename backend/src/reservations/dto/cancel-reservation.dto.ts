import { IsNotEmpty, IsString } from 'class-validator';

export class CancelReservationDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
