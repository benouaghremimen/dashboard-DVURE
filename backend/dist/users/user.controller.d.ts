import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): Promise<{
        id: number;
        email: string;
        name?: string;
        clubName?: string;
        passwordIsHashed: boolean;
        role: "ADMIN" | "CLUB";
        isActive: boolean;
        createdAt: Date;
        reservations: import("../reservations/reservation.entity").Reservation[];
    }[]>;
    create(dto: CreateUserDto): Promise<{
        id: number;
        email: string;
        name?: string;
        clubName?: string;
        passwordIsHashed: boolean;
        role: "ADMIN" | "CLUB";
        isActive: boolean;
        createdAt: Date;
        reservations: import("../reservations/reservation.entity").Reservation[];
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        name?: string;
        clubName?: string;
        passwordIsHashed: boolean;
        role: "ADMIN" | "CLUB";
        isActive: boolean;
        createdAt: Date;
        reservations: import("../reservations/reservation.entity").Reservation[];
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=user.controller.d.ts.map