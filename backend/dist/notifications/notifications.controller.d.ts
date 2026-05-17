import { Request } from 'express';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findMine(req: Request & {
        user: {
            id: number;
            role: string;
        };
    }): Promise<{
        items: import("./notification.entity").Notification[];
        unread: number;
    }>;
    markAsRead(id: number, req: Request & {
        user: {
            id: number;
        };
    }): Promise<{
        success: boolean;
    }>;
    markAllAsRead(req: Request & {
        user: {
            id: number;
        };
    }): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=notifications.controller.d.ts.map