import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '../users/user.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    let isMatch = user.passwordIsHashed
      ? await bcrypt.compare(pass, user.password)
      : pass === user.password;

    // Legacy fallback: handle mismatched hash flags or stored values
    if (!isMatch) {
      if (user.passwordIsHashed && pass === user.password) {
        isMatch = true;
        await this.userService.updatePassword(user, pass);
      } else if (!user.passwordIsHashed && await bcrypt.compare(pass, user.password)) {
        isMatch = true;
        await this.userService.updatePassword(user, pass);
      }
    }
    if (!isMatch) return null;

    // Remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return this.login(user); // Auto-login after register
  }

  async requestPasswordReset(email: string) {
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
    } catch {
      // Ignore mail errors in dev environments
    }

    if (process.env.NODE_ENV !== 'production') {
      return { success: true, resetToken: rawToken };
    }

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetUser = await this.userService.findByResetTokenHash(tokenHash);

    if (!resetUser || !resetUser.resetPasswordExpiresAt || resetUser.resetPasswordExpiresAt < new Date()) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    await this.userService.updatePassword(resetUser, newPassword);
    return { success: true };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const isMatch = user.passwordIsHashed
      ? await bcrypt.compare(currentPassword, user.password)
      : currentPassword === user.password;
    if (!isMatch) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    await this.userService.updatePassword(user, newPassword);
    return { success: true };
  }
}
