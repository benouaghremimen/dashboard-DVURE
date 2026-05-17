import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { AnnouncementDto } from './dto/announcement.dto';
import { ReservationRoom } from '../reservations/reservation-room.entity';
export declare class NotificationsService {
    private readonly notificationRepo;
    private readonly userRepo;
    private readonly mailService;
    constructor(notificationRepo: Repository<Notification>, userRepo: Repository<User>, mailService: MailerService);
    notifyReservationStatusChange(user: User, status: string, comment?: string): Promise<void>;
    sendAnnouncement(dto: AnnouncementDto): Promise<void>;
    notifyReservationCancelled(user: User, reason: string): Promise<void>;
    notifyReservationPartialDecision(user: User, reservationName: string, approvedRooms: ReservationRoom[], rejectedRooms: ReservationRoom[]): Promise<void>;
    findForUser(userId: number): Promise<Notification[]>;
    unreadCount(userId: number): Promise<number>;
    markAsRead(notificationId: number, userId: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
}
//# sourceMappingURL=notifications.service.d.ts.map