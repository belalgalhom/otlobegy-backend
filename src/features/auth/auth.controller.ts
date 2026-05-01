import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LogoutDto,
} from './dto/auth.dto';
import { Guest } from '../../common/decorators/guest.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../../common/interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Guest()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Guest()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Guest()
  @Post('verify/request')
  sendVerification(@Body() dto: SendOtpDto) {
    return this.authService.requestVerification(dto);
  }

  @Guest()
  @Post('verify/confirm')
  @HttpCode(HttpStatus.OK)
  confirmVerification(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyContact(dto);
  }

  @Guest()
  @Post('password/forgot')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Guest()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: any) {
    const { payload, rawRefreshToken } = req.user as {
      payload: JwtRefreshPayload;
      rawRefreshToken: string;
    };
    return this.authService.refreshTokens(payload, rawRefreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: LogoutDto,
  ) {
    return this.authService.logout(user.sub, user.sid, dto);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  logoutAll(@CurrentUser('sub') userId: string) {
    return this.authService.logoutAll(userId);
  }
}