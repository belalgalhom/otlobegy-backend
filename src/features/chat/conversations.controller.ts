import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import {
  CreateOrderConversationDto,
  CreateSupportConversationDto,
  QueryConversationsDto,
} from './dto/chat.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat - Conversations')
@ApiBearerAuth()
@Controller('chat/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('order')
  @ApiOperation({ summary: 'Create a new conversation for an order' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  createOrder(
    @CurrentUser() actor: JwtAccessPayload,
    @Body() dto: CreateOrderConversationDto,
  ) {
    return this.conversationsService.createOrderConversation(actor, dto);
  }

  @Post('support')
  @ApiOperation({ summary: 'Create a new support conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  createSupport(
    @CurrentUser() actor: JwtAccessPayload,
    @Body() dto: CreateSupportConversationDto,
  ) {
    return this.conversationsService.createSupportConversation(actor, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my conversations' })
  @ApiResponse({ status: 200, description: 'List of conversations returned' })
  listMine(
    @CurrentUser() actor: JwtAccessPayload,
    @Query() dto: QueryConversationsDto,
  ) {
    return this.conversationsService.listMyConversations(actor, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation returned' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  getOne(@CurrentUser() actor: JwtAccessPayload, @Param('id') id: string) {
    return this.conversationsService.getConversation(actor, id);
  }

  @Patch(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation closed successfully' })
  close(@CurrentUser() actor: JwtAccessPayload, @Param('id') id: string) {
    return this.conversationsService.closeConversation(actor, id);
  }
}
