import { ReservationType } from '../reservation.entity';
export declare class ReservationRoomDto {
    roomId: number;
    startTime: string;
    endTime: string;
}
export declare class CreateReservationDto {
    event_name: string;
    description?: string;
    type: ReservationType;
    rooms: ReservationRoomDto[];
}
//# sourceMappingURL=create-reservation.dto.d.ts.map