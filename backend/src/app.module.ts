import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Room } from './rooms/room.entity';
import { ReservationRoom } from './reservations/reservation-room.entity';
import { ReservationModule } from './reservations/reservation.module';
import { Reservation } from './reservations/reservation.entity';
import { UsersModule } from './users/users.module';
import { CalendarModule } from './calendar/calendar.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsModule } from './notifications/notifications.module';
import { RoomModule } from './rooms/room.module';
import { Notification } from './notifications/notification.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'dvure',
      entities: [User, Room, Reservation, ReservationRoom, Notification],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'benouaghremimen1@gmail.com',
          pass: 'ltdbsqmohrofskyb',
        },
      },
    }),
    AuthModule,
    UsersModule,
    RoomModule,
    ReservationModule,
    CalendarModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'benouaghremimen1@gmail.com',
          pass: 'ltdbsqmohrofskyb',
        },
      },
      defaults: {
        from: '"No Reply" <benouaghremimen1@gmail.com>',
      },
    }),
    NotificationsModule,
  ],
})
export class AppModule { }
