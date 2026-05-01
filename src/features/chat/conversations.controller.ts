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

@Controller('chat/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('order')
  createOrder(
    @CurrentUser() actor: JwtAccessPayload,
    @Body() dto: CreateOrderConversationDto,
  ) {
    return this.conversationsService.createOrderConversation(actor, dto);
  }

  @Post('support')
  createSupport(
    @CurrentUser() actor: JwtAccessPayload,
    @Body() dto: CreateSupportConversationDto,
  ) {
    return this.conversationsService.createSupportConversation(actor, dto);
  }

  @Get()
  listMine(
    @CurrentUser() actor: JwtAccessPayload,
    @Query() dto: QueryConversationsDto,
  ) {
    return this.conversationsService.listMyConversations(actor, dto);
  }

  @Get(':id')
  getOne(@CurrentUser() actor: JwtAccessPayload, @Param('id') id: string) {
    return this.conversationsService.getConversation(actor, id);
  }

  @Patch(':id/close')
  @HttpCode(HttpStatus.OK)
  close(@CurrentUser() actor: JwtAccessPayload, @Param('id') id: string) {
    return this.conversationsService.closeConversation(actor, id);
  }
}
