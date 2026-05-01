import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { OtpRequestedEvent } from '../../common/events';
import {
  LoginDto,
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LogoutDto,
} from './dto/auth.dto';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../../common/interfaces/jwt-payload.interface';
import {
  AuthErrors,
  CommonSuccess,
} from '../../common/constants/response.constants';
import {
  JWT_ACCESS_SERVICE,
  JWT_REFRESH_SERVICE,
} from '../../common/constants/jwt.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    @Inject(JWT_ACCESS_SERVICE) private accessJwt: JwtService,
    @Inject(JWT_REFRESH_SERVICE) private refreshJwt: JwtService,
    private otpService: OtpService,
    private eventEmitter: EventEmitter2,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.isEmailVerified) {
        throw new ConflictException(AuthErrors.USER_EXISTS);
      }
      await this.prisma.user.delete({ where: { id: existing.id } });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone ?? null,
        password: hashedPassword,
        name: dto.name,
        role: 'CUSTOMER',
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    });

    if (user.email) {
      await this.requestVerification({ contact: user.email, method: 'EMAIL' });
    }

    const tokens = await this.createSession(user.id, user.role, false);
    const { password: _, ...userWithoutPassword } = user;
    return { ...tokens, user: userWithoutPassword };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
    }

    if (user.isBanned) {
      throw new UnauthorizedException(
        user.banReason
          ? `${AuthErrors.BANNED}: ${user.banReason}`
          : AuthErrors.BANNED,
      );
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(AuthErrors.UNVERIFIED);
    }

    const tokens = await this.createSession(user.id, user.role, true);
    const { password: _, ...userWithoutPassword } = user;
    return { ...tokens, user: userWithoutPassword };
  }

  async requestVerification(dto: SendOtpDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.contact }, { phone: dto.contact }] },
    });
    if (!user) throw new NotFoundException(AuthErrors.USER_NOT_FOUND);

    await this.otpService.deleteOtp(dto.contact, 'VERIFICATION');
    const code = await this.otpService.generateOtp(dto.contact, 'VERIFICATION');

    this.eventEmitter.emit(
      'auth.otp.requested',
      new OtpRequestedEvent(dto.contact, code, dto.method, 'VERIFICATION'),
    );

    return { message: CommonSuccess.OPERATION_SUCCESS };
  }

  async verifyContact(dto: VerifyOtpDto) {
    const isPasswordReset = dto.purpose === 'PASSWORD_RESET';

    const isValid = isPasswordReset
      ? await this.otpService.peekOtp(dto.contact, dto.code, 'PASSWORD_RESET')
      : await this.otpService.validateOtp(
          dto.contact,
          dto.code,
          'VERIFICATION',
        );

    if (!isValid) throw new BadRequestException(AuthErrors.OTP_INVALID);

    if (!isPasswordReset) {
      const isEmail = dto.contact.includes('@');
      await this.prisma.user.update({
        where: isEmail ? { email: dto.contact } : { phone: dto.contact },
        data: {
          isEmailVerified: isEmail ? true : undefined,
          isPhoneVerified: !isEmail ? true : undefined,
        },
      });
    }

    return { message: CommonSuccess.OPERATION_SUCCESS };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.contact }, { phone: dto.contact }] },
    });

    if (!user) {
      return { message: CommonSuccess.FORGOT_PASSWORD_SENT };
    }

    const isEmail = dto.contact.includes('@');
    const method = isEmail ? 'EMAIL' : ('SMS' as const);

    await this.otpService.deleteOtp(dto.contact, 'PASSWORD_RESET');
    const code = await this.otpService.generateOtp(
      dto.contact,
      'PASSWORD_RESET',
    );

    this.eventEmitter.emit(
      'auth.otp.requested',
      new OtpRequestedEvent(dto.contact, code, method, 'PASSWORD_RESET'),
    );

    return { message: CommonSuccess.FORGOT_PASSWORD_SENT };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const isValid = await this.otpService.validateOtp(
      dto.contact,
      dto.code,
      'PASSWORD_RESET',
    );
    if (!isValid) throw new BadRequestException(AuthErrors.OTP_INVALID);

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    const isEmail = dto.contact.includes('@');

    const user = await this.prisma.user.update({
      where: isEmail ? { email: dto.contact } : { phone: dto.contact },
      data: { password: hashedPassword },
      select: { id: true },
    });

    await this.prisma.session.deleteMany({ where: { userId: user.id } });

    return { message: CommonSuccess.OPERATION_SUCCESS };
  }

  async refreshTokens(payload: JwtRefreshPayload, rawRefreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            isBanned: true,
            banReason: true,
            isEmailVerified: true,
          },
        },
      },
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException(AuthErrors.SESSION_EXPIRED);
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException(AuthErrors.SESSION_EXPIRED);
    }

    const isMatch = await bcrypt.compare(rawRefreshToken, session.hashedRt);
    if (!isMatch) {
      await this.prisma.session.deleteMany({ where: { userId: payload.sub } });
      throw new UnauthorizedException(AuthErrors.SESSION_EXPIRED);
    }

    const user = session.user;

    if (user.isBanned) {
      throw new UnauthorizedException(
        user.banReason
          ? `${AuthErrors.BANNED}: ${user.banReason}`
          : AuthErrors.BANNED,
      );
    }

    await this.prisma.session.delete({ where: { id: session.id } });
    return this.createSession(user.id, user.role, user.isEmailVerified);
  }

  async logout(userId: string, sessionId: string, dto: LogoutDto) {
    await this.prisma.session.deleteMany({
      where: { id: sessionId, userId },
    });

    if (dto.fcmToken) {
      await this.prisma.device.deleteMany({
        where: { userId, token: dto.fcmToken },
      });
    }

    return { message: CommonSuccess.OPERATION_SUCCESS };
  }

  async logoutAll(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
    await this.prisma.device.deleteMany({ where: { userId } });
    return { message: CommonSuccess.OPERATION_SUCCESS };
  }

  private async createSession(
    userId: string,
    role: string,
    verified: boolean,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const refreshExpiresIn = this.config.getOrThrow<string>(
      'JWT_REFRESH_EXPIRATION',
    );

    const expiresAt = this.parseExpiry(refreshExpiresIn);

    const session = await this.prisma.session.create({
      data: {
        userId,
        hashedRt: 'pending',
        expiresAt,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      },
    });

    const accessPayload: JwtAccessPayload = {
      sub: userId,
      sid: session.id,
      role: role as any,
      verified,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: userId,
      sid: session.id,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.accessJwt.signAsync(accessPayload),
      this.refreshJwt.signAsync(refreshPayload),
    ]);

    const hashedRt = await bcrypt.hash(refresh_token, 10);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { hashedRt },
    });

    return { access_token, refresh_token };
  }

  private parseExpiry(expiry: string): Date {
    const now = Date.now();
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    const ms: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const multiplier = ms[unit] ?? ms['d'];
    return new Date(now + value * multiplier);
  }
}
