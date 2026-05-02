import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '+201234567890', required: false })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  contact!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS'] })
  @IsEnum(['EMAIL', 'SMS'])
  @IsNotEmpty()
  method!: 'EMAIL' | 'SMS';
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    enum: ['VERIFICATION', 'PASSWORD_RESET'],
    default: 'VERIFICATION',
    required: false,
  })
  @IsOptional()
  @IsEnum(['VERIFICATION', 'PASSWORD_RESET'])
  purpose?: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION';
}

export class LogoutDto {
  @ApiProperty({ example: 'fcm-token-123', required: false })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}
