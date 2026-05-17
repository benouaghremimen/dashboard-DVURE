import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationsController } from './notifications.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, User]),
    ],
    providers: [NotificationsService],
    controllers: [NotificationsController],
    exports: [NotificationsService],
})
export class NotificationsModule { }
