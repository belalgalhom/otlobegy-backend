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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat - Messages')
@ApiBearerAuth()
@Controller('chat/conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  send(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.send(actor, conversationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List messages in a conversation' })
  @ApiResponse({ status: 200, description: 'List of messages returned' })
  list(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('conversationId') conversationId: string,
    @Query() dto: QueryMessagesDto,
  ) {
    return this.messagesService.list(actor, conversationId, dto);
  }

  @Patch('read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  markRead(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('conversationId') conversationId: string,
    @Body() dto: MarkReadDto,
  ) {
    return this.messagesService.markRead(actor, conversationId, dto);
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  delete(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.deleteMessage(actor, messageId);
  }
}
