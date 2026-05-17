import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '../users/user.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly mailerService;
    constructor(userService: UserService, jwtService: JwtService, mailerService: MailerService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(dto: CreateUserDto): Promise<{
        access_token: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        success: boolean;
        resetToken?: undefined;
    } | {
        success: boolean;
        resetToken: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map