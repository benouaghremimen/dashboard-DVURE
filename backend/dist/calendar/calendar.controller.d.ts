import { CalendarService } from "./calendar.service";
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    getCalendar(start: string, end: string): Promise<import("./calendar.dto").CalendarSlotDto[]>;
}
//# sourceMappingURL=calendar.controller.d.ts.map