import {
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '@prisma/client';

export class QueryNotificationsDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  unreadOnly?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

export class MarkNotificationsReadDto {
  @IsOptional()
  ids?: string[];
}

export class CreateNotificationDto {
  userId!: string;
  title!: string;
  titleAr?: string | null;
  body?: string | null;
  bodyAr?: string | null;
  type!: NotificationType;
  data?: Record<string, any>;
}