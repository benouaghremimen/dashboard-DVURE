import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Reservation } from '../reservations/reservation.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private readonly userRepo;
    private readonly reservationRepo;
    constructor(userRepo: Repository<User>, reservationRepo: Repository<Reservation>);
    findOne(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByResetTokenHash(tokenHash: string): Promise<User | null>;
    create(dto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    update(id: number, dto: UpdateUserDto): Promise<User>;
    setResetToken(user: User, tokenHash: string, expiresAt: Date): Promise<User>;
    clearResetToken(user: User): Promise<User>;
    updatePassword(user: User, newPassword: string): Promise<User>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map