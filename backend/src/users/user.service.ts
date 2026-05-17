import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity'; // Corrected import path (same dir)
import { Reservation } from '../reservations/reservation.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
    ) { }

    findOne(id: number): Promise<User | null> {
        return this.userRepo.findOne({ where: { id } });
    }

    findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { email } });
    }

    findByResetTokenHash(tokenHash: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { resetPasswordTokenHash: tokenHash } });
    }

    async create(dto: CreateUserDto): Promise<User> {
        const existing = await this.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const storedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepo.create({
            ...dto,
            password: storedPassword,
            passwordIsHashed: true,
        });

        return this.userRepo.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepo.find({
            order: { id: 'DESC' },
        });
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (dto.email && dto.email !== user.email) {
            const existing = await this.findByEmail(dto.email);
            if (existing) {
                throw new ConflictException('Email already in use');
            }
            user.email = dto.email;
        }

        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10);
            user.passwordIsHashed = true;
        }

        if (dto.role) {
            user.role = dto.role;
        }

        if (typeof dto.isActive === 'boolean') {
            user.isActive = dto.isActive;
        }

        if (typeof dto.name === 'string') {
            user.name = dto.name;
        }

        if (typeof dto.clubName === 'string') {
            user.clubName = dto.clubName;
        }

        return this.userRepo.save(user);
    }

    async setResetToken(user: User, tokenHash: string, expiresAt: Date) {
        user.resetPasswordTokenHash = tokenHash;
        user.resetPasswordExpiresAt = expiresAt;
        return this.userRepo.save(user);
    }

    async clearResetToken(user: User) {
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        return this.userRepo.save(user);
    }

    async updatePassword(user: User, newPassword: string) {
        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordIsHashed = true;
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        return this.userRepo.save(user);
    }

    async remove(id: number): Promise<void> {
        await this.reservationRepo
            .createQueryBuilder()
            .delete()
            .where('clubId = :id', { id })
            .execute();
        const result = await this.userRepo.delete(id);
        if (!result.affected) {
            throw new NotFoundException('User not found');
        }
    }
}
