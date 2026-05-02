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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Guest()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Guest()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Guest()
  @Post('verify/request')
  @ApiOperation({ summary: 'Request a verification code (OTP)' })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  sendVerification(@Body() dto: SendOtpDto) {
    return this.authService.requestVerification(dto);
  }

  @Guest()
  @Post('verify/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm verification code (OTP)' })
  @ApiResponse({ status: 200, description: 'Contact verified successfully' })
  confirmVerification(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyContact(dto);
  }

  @Guest()
  @Post('password/forgot')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 201, description: 'Reset code sent successfully' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Guest()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  refreshTokens(@Req() req: any) {
    const { payload, rawRefreshToken } = req.user as {
      payload: JwtRefreshPayload;
      rawRefreshToken: string;
    };
    return this.authService.refreshTokens(payload, rawRefreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@CurrentUser() user: JwtAccessPayload, @Body() dto: LogoutDto) {
    return this.authService.logout(user.sub, user.sid, dto);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all sessions' })
  @ApiResponse({ status: 200, description: 'Logged out from all sessions successfully' })
  logoutAll(@CurrentUser('sub') userId: string) {
    return this.authService.logoutAll(userId);
  }
}
