import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  QueryNotificationsDto,
  MarkNotificationsReadDto,
} from './dto/notification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications returned' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() dto: QueryNotificationsDto,
  ) {
    return this.notificationsService.list(userId, dto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count returned' })
  unreadCount(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification returned' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  getOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.getOne(userId, id);
  }

  @Patch('read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  markRead(
    @CurrentUser('sub') userId: string,
    @Body() dto: MarkNotificationsReadDto,
  ) {
    return this.notificationsService.markRead(userId, dto);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markOneRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.markOneRead(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specific notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  deleteOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.deleteOne(userId, id);
  }

  @Delete('read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({ status: 200, description: 'All read notifications deleted' })
  deleteAllRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.deleteAllRead(userId);
  }
}
