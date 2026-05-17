import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        id: any;
        role: any;
        email: any;
        name: any;
        clubName: any;
        isActive: any;
        access_token: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        resetToken?: undefined;
    } | {
        success: boolean;
        resetToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
    register(dto: CreateUserDto): Promise<{
        access_token: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map