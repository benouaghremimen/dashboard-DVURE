"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
const user_entity_1 = require("../users/user.entity");
const mailer_1 = require("@nestjs-modules/mailer");
let NotificationsService = class NotificationsService {
    constructor(notificationRepo, userRepo, mailService) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
        this.mailService = mailService;
    }
    async notifyReservationStatusChange(user, status, comment) {
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
                createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - 60 * 1000)),
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
        }
        catch (e) {
            console.error('Failed to send email', e);
        }
    }
    async sendAnnouncement(dto) {
        const users = dto.userIds
            ? await this.userRepo.findBy({ id: (0, typeorm_2.In)(dto.userIds) })
            : await this.userRepo.find(); // If no IDs, send to all? Or maybe filtered by role? Keeping simple for now based on snippet.
        for (const user of users) {
            // In-app
            await this.notificationRepo.save(this.notificationRepo.create({
                title: dto.title,
                message: dto.message,
                user,
            }));
            // Email
            try {
                await this.mailService.sendMail({
                    to: user.email,
                    subject: dto.title,
                    text: dto.message,
                });
            }
            catch (e) {
                console.error(`Failed to send email to ${user.email}`, e);
            }
        }
    }
    async notifyReservationCancelled(user, reason) {
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
                createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - 60 * 1000)),
            },
            relations: ['user'],
        });
        if (recentDuplicate) {
            return;
        }
        await this.notificationRepo.save(this.notificationRepo.create({
            title,
            message,
            user,
        }));
        try {
            await this.mailService.sendMail({
                to: user.email,
                subject: title,
                text: message,
            });
        }
        catch (e) {
            console.error('Failed to send email', e);
        }
    }
    async notifyReservationPartialDecision(user, reservationName, approvedRooms, rejectedRooms) {
        if (String(user.role || '').toUpperCase() !== 'CLUB') {
            return;
        }
        const title = 'Décision partielle de réservation';
        const formatSlot = (slot) => {
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
        let message = `Votre demande "${reservationName}" est partiellement approuvée.\n` +
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
                createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - 60 * 1000)),
            },
            relations: ['user'],
        });
        if (recentDuplicate) {
            return;
        }
        await this.notificationRepo.save(this.notificationRepo.create({
            title,
            message,
            user,
        }));
        try {
            await this.mailService.sendMail({
                to: user.email,
                subject: title,
                text: message,
            });
        }
        catch (e) {
            console.error('Failed to send email', e);
        }
    }
    async findForUser(userId) {
        return this.notificationRepo.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async unreadCount(userId) {
        return this.notificationRepo.count({
            where: { user: { id: userId }, isRead: false },
        });
    }
    async markAsRead(notificationId, userId) {
        await this.notificationRepo.update({ id: notificationId, user: { id: userId } }, { isRead: true });
    }
    async markAllAsRead(userId) {
        await this.notificationRepo.update({ user: { id: userId }, isRead: false }, { isRead: true });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mailer_1.MailerService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map