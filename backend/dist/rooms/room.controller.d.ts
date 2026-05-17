import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
export declare class RoomController {
    private readonly roomService;
    constructor(roomService: RoomService);
    create(dto: CreateRoomDto): Promise<import("./room.entity").Room>;
    update(id: string, dto: UpdateRoomDto): Promise<import("./room.entity").Room | null>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    toggle(id: string): Promise<import("./room.entity").Room>;
    findAll(): Promise<import("./room.entity").Room[]>;
    getAvailability(start: string, end: string): Promise<import("./room.entity").Room[]>;
}
//# sourceMappingURL=room.controller.d.ts.map