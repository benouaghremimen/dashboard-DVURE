import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Reservation } from '../reservations/reservation.entity';
import { UserController } from './user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, Reservation])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UsersModule { }
