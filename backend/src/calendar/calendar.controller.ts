import { Controller, Get, Query } from "@nestjs/common";
import { CalendarService } from "./calendar.service";

@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    @Get()
    getCalendar(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        return this.calendarService.getCalendar(
            new Date(start),
            new Date(end),
        );
    }
}
