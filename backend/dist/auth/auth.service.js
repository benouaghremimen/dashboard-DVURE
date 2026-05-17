"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const mailer_1 = require("@nestjs-modules/mailer");
const user_service_1 = require("../users/user.service");
let AuthService = class AuthService {
    constructor(userService, jwtService, mailerService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
    }
    async validateUser(email, pass) {
        const user = await this.userService.findByEmail(email);
        if (!user)
            return null;
        let isMatch = user.passwordIsHashed
            ? await bcrypt.compare(pass, user.password)
            : pass === user.password;
        // Legacy fallback: handle mismatched hash flags or stored values
        if (!isMatch) {
            if (user.passwordIsHashed && pass === user.password) {
                isMatch = true;
                await this.userService.updatePassword(user, pass);
            }
            else if (!user.passwordIsHashed && await bcrypt.compare(pass, user.password)) {
                isMatch = true;
                await this.userService.updatePassword(user, pass);
            }
        }
        if (!isMatch)
            return null;
        // Remove password from returned object
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(dto) {
        const user = await this.userService.create(dto);
        return this.login(user); // Auto-login after register
    }
    async requestPasswordReset(email) {
        const user = await this.userService.findByEmail(email);
        // Always respond success to avoid user enumeration
        if (!user) {
            return { success: true };
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.userService.setResetToken(user, tokenHash, expiresAt);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Réinitialisation de mot de passe',
                text: `Pour réinitialiser votre mot de passe, utilisez ce lien : ${resetLink}`,
                html: `<p>Pour réinitialiser votre mot de passe, utilisez ce lien :</p><p><a href="${resetLink}">${resetLink}</a></p>`,
            });
        }
        catch {
            // Ignore mail errors in dev environments
        }
        if (process.env.NODE_ENV !== 'production') {
            return { success: true, resetToken: rawToken };
        }
        return { success: true };
    }
    async resetPassword(token, newPassword) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const resetUser = await this.userService.findByResetTokenHash(tokenHash);
        if (!resetUser || !resetUser.resetPasswordExpiresAt || resetUser.resetPasswordExpiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Token invalide ou expiré');
        }
        await this.userService.updatePassword(resetUser, newPassword);
        return { success: true };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        }
        const isMatch = user.passwordIsHashed
            ? await bcrypt.compare(currentPassword, user.password)
            : currentPassword === user.password;
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Mot de passe actuel incorrect');
        }
        await this.userService.updatePassword(user, newPassword);
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        mailer_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map