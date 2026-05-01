import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto, QueryMessagesDto, MarkReadDto } from './dto/chat.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('chat/conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.send(actor, conversationId, dto);
  }

  @Get()
  list(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('conversationId') conversationId: string,
    @Query() dto: QueryMessagesDto,
  ) {
    return this.messagesService.list(actor, conversationId, dto);
  }

  @Patch('read')
  @HttpCode(HttpStatus.OK)
  markRead(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('conversationId') conversationId: string,
    @Body() dto: MarkReadDto,
  ) {
    return this.messagesService.markRead(actor, conversationId, dto);
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.OK)
  delete(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.deleteMessage(actor, messageId);
  }
}
