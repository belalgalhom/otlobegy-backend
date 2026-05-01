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
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  QueryTicketsDto,
} from './dto/ticket.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @CurrentUser() actor: JwtAccessPayload,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketsService.create(actor, dto);
  }

  @Get()
  list(
    @CurrentUser() actor: JwtAccessPayload,
    @Query() dto: QueryTicketsDto,
  ) {
    return this.ticketsService.list(actor, dto);
  }

  @Get(':id')
  getOne(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('id') id: string,
  ) {
    return this.ticketsService.getOne(actor, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(actor, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('id') id: string,
  ) {
    return this.ticketsService.remove(actor, id);
  }
}