import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  IsInt,
  Min,
  Max,
  ValidateIf,
  IsNumber,
  IsPositive,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '@prisma/client';

export class CreateOrderConversationDto {
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;
}

export class CreateSupportConversationDto {
  @IsUUID()
  @IsNotEmpty()
  vendorId!: string;
}

export class QueryConversationsDto {
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

export class MediaMetadataDto {
  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  sizeBytes?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  durationSeconds?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  height?: number;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsOptional()
  waveform?: number[];
}

export class LocationMetadataDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  location!: [number, number];

  @IsString()
  @IsOptional()
  address?: string;
}

export class SendMessageDto {
  @IsEnum(MessageType)
  @IsNotEmpty()
  type!: MessageType;

  @ValidateIf((o) => o.type === MessageType.TEXT)
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text?: string;

  @ValidateIf((o) =>
    [MessageType.IMAGE, MessageType.VIDEO, MessageType.AUDIO].includes(o.type),
  )
  @IsString()
  @IsNotEmpty()
  mediaUrl?: string;

  @IsOptional()
  metadata?: MediaMetadataDto | LocationMetadataDto | Record<string, any>;

  @IsUUID()
  @IsOptional()
  replyToId?: string;
}

export class QueryMessagesDto {
  @IsUUID()
  @IsOptional()
  before?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30;
}

export class MarkReadDto {
  @IsUUID()
  @IsOptional()
  lastReadMessageId?: string;
}
