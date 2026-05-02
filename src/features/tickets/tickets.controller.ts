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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Support Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  create(@CurrentUser() actor: JwtAccessPayload, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(actor, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List support tickets with filters' })
  @ApiResponse({ status: 200, description: 'List of tickets returned' })
  list(@CurrentUser() actor: JwtAccessPayload, @Query() dto: QueryTicketsDto) {
    return this.ticketsService.list(actor, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific support ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket returned' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  getOne(@CurrentUser() actor: JwtAccessPayload, @Param('id') id: string) {
    return this.ticketsService.getOne(actor, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a support ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  update(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(actor, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete/Cancel a support ticket' })
  @ApiResponse({ status: 200, description: 'Ticket removed successfully' })
  remove(@CurrentUser() actor: JwtAccessPayload, @Param('id') id: string) {
    return this.ticketsService.remove(actor, id);
  }
}
