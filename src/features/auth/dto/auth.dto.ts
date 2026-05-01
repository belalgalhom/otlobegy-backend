import { 
  IsEmail, 
  IsString, 
  IsPhoneNumber, 
  IsOptional, 
  IsEnum, 
  IsNotEmpty, 
  MinLength 
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  contact!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @IsEnum(['EMAIL', 'SMS'])
  @IsNotEmpty()
  method!: 'EMAIL' | 'SMS';
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsEnum(['VERIFICATION', 'PASSWORD_RESET'])
  purpose?: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION';
}

export class LogoutDto {
  @IsString()
  @IsOptional()
  fcmToken?: string;
}