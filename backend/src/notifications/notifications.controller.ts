import {
    Controller,
    Get,
    Patch,
    Param,
    ParseIntPipe,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    @Get()
    async findMine(@Req() req: Request & { user: { id: number; role: string } }) {
        if (String(req.user.role || '').toUpperCase() === 'ADMIN') {
            return { items: [], unread: 0 };
        }
        const [items, unread] = await Promise.all([
            this.notificationsService.findForUser(req.user.id),
            this.notificationsService.unreadCount(req.user.id),
        ]);

        return { items, unread };
    }

    @Patch(':id/read')
    async markAsRead(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request & { user: { id: number } },
    ) {
        await this.notificationsService.markAsRead(id, req.user.id);
        return { success: true };
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: Request & { user: { id: number } }) {
        await this.notificationsService.markAllAsRead(req.user.id);
        return { success: true };
    }
}
