import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { AnnouncementDto } from './dto/announcement.dto';
import { ReservationRoom } from '../reservations/reservation-room.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly mailService: MailerService,
    ) { }

    async notifyReservationStatusChange(
        user: User,
        status: string,
        comment?: string,
    ) {
        if (String(user.role || '').toUpperCase() !== 'CLUB') {
            return;
        }
        const title = 'Mise à jour de réservation';
        const message = `Votre demande a été ${status}`;

        const recentDuplicate = await this.notificationRepo.findOne({
            where: {
                user: { id: user.id },
                title,
                message,
                createdAt: MoreThan(new Date(Date.now() - 60 * 1000)),
            },
            relations: ['user'],
        });
        if (recentDuplicate) {
            return;
        }
        // In-app
        const notification = this.notificationRepo.create({
            title,
            message,
            user,
        });
        await this.notificationRepo.save(notification);

        // Email
        try {
            await this.mailService.sendMail({
                to: user.email,
                subject: 'Mise à jour de votre réservation',
                text: `Votre demande a été ${status}. ${comment ? 'Commentaire: ' + comment : ''}`,
            });
        } catch (e) {
            console.error('Failed to send email', e);
        }
    }

    async sendAnnouncement(dto: AnnouncementDto) {
        const users = dto.userIds
            ? await this.userRepo.findBy({ id: In(dto.userIds) })
            : await this.userRepo.find(); // If no IDs, send to all? Or maybe filtered by role? Keeping simple for now based on snippet.

        for (const user of users) {
            // In-app
            await this.notificationRepo.save(
                this.notificationRepo.create({
                    title: dto.title,
                    message: dto.message,
                    user,
                }),
            );

            // Email
            try {
                await this.mailService.sendMail({
                    to: user.email,
                    subject: dto.title,
                    text: dto.message,
                });
            } catch (e) {
                console.error(`Failed to send email to ${user.email}`, e);
            }
        }
    }

    async notifyReservationCancelled(user: User, reason: string) {
        if (String(user.role || '').toUpperCase() !== 'CLUB') {
            return;
        }

        const title = 'Annulation de réservation';
        const message = `Votre réservation a été annulée. Raison : ${reason}. Veuillez soumettre une nouvelle demande.`;

        const recentDuplicate = await this.notificationRepo.findOne({
            where: {
                user: { id: user.id },
                title,
                message,
                createdAt: MoreThan(new Date(Date.now() - 60 * 1000)),
            },
            relations: ['user'],
        });
        if (recentDuplicate) {
            return;
        }

        await this.notificationRepo.save(
            this.notificationRepo.create({
                title,
                message,
                user,
            }),
        );

        try {
            await this.mailService.sendMail({
                to: user.email,
                subject: title,
                text: message,
            });
        } catch (e) {
            console.error('Failed to send email', e);
        }
    }

    async notifyReservationPartialDecision(
        user: User,
        reservationName: string,
        approvedRooms: ReservationRoom[],
        rejectedRooms: ReservationRoom[],
    ) {
        if (String(user.role || '').toUpperCase() !== 'CLUB') {
            return;
        }

        const title = 'Décision partielle de réservation';

        const formatSlot = (slot: ReservationRoom) => {
            const roomName = slot.room?.name || 'Salle';
            const start = slot.start_datetime ? new Date(slot.start_datetime).toLocaleString('fr-FR') : '';
            const end = slot.end_datetime ? new Date(slot.end_datetime).toLocaleString('fr-FR') : '';
            const reason = slot.admin_comment ? ` (Raison: ${slot.admin_comment})` : '';
            return `${roomName} | ${start} - ${end}${reason}`;
        };

        const approvedText = approvedRooms.length
            ? approvedRooms.map(formatSlot).join('\n')
            : 'Aucun créneau approuvé.';
        const rejectedText = rejectedRooms.length
            ? rejectedRooms.map(formatSlot).join('\n')
            : 'Aucun créneau refusé.';

        let message =
            `Votre demande "${reservationName}" est partiellement approuvée.\n` +
            `Créneaux approuvés :\n${approvedText}\n\n` +
            `Créneaux refusés :\n${rejectedText}`;

        if (message.length > 1900) {
            message = message.slice(0, 1900) + '\n...';
        }

        const recentDuplicate = await this.notificationRepo.findOne({
            where: {
                user: { id: user.id },
                title,
                message,
                createdAt: MoreThan(new Date(Date.now() - 60 * 1000)),
            },
            relations: ['user'],
        });
        if (recentDuplicate) {
            return;
        }

        await this.notificationRepo.save(
            this.notificationRepo.create({
                title,
                message,
                user,
            }),
        );

        try {
            await this.mailService.sendMail({
                to: user.email,
                subject: title,
                text: message,
            });
        } catch (e) {
            console.error('Failed to send email', e);
        }
    }


    async findForUser(userId: number) {
        return this.notificationRepo.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async unreadCount(userId: number) {
        return this.notificationRepo.count({
            where: { user: { id: userId }, isRead: false },
        });
    }

    async markAsRead(notificationId: number, userId: number) {
        await this.notificationRepo.update(
            { id: notificationId, user: { id: userId } },
            { isRead: true },
        );
    }

    async markAllAsRead(userId: number) {
        await this.notificationRepo.update(
            { user: { id: userId }, isRead: false },
            { isRead: true },
        );
    }
}

