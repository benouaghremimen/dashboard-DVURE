import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // Corrected typo
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module'; // Corrected import
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
