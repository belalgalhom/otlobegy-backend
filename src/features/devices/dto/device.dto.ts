import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DevicePlatform } from '@prisma/client';

export class RegisterDeviceDto {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;
}
