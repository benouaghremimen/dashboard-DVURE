import { Reservation } from '../reservations/reservation.entity';
export declare class User {
    id: number;
    email: string;
    name?: string;
    clubName?: string;
    password: string;
    passwordIsHashed: boolean;
    resetPasswordTokenHash?: string | null;
    resetPasswordExpiresAt?: Date | null;
    role: 'ADMIN' | 'CLUB';
    isActive: boolean;
    createdAt: Date;
    reservations: Reservation[];
}
//# sourceMappingURL=user.entity.d.ts.map