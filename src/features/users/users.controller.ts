import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import {
  UpdateUserDto,
  UpdateNotificationSettingsDto,
  ChangePasswordDto,
} from './dto/user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Users - Profile & Settings')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile information' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  getUser(@CurrentUser('sub') userId: string) {
    return this.userService.getUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile information' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateUser(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(userId, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload my avatar image' })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(userId, file);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change my password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, dto);
  }

  @Get('me/notification-settings')
  @ApiOperation({ summary: 'Get my notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings returned' })
  getNotificationSettings(@CurrentUser('sub') userId: string) {
    return this.userService.getNotificationSettings(userId);
  }

  @Patch('me/notification-settings')
  @ApiOperation({ summary: 'Update my notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings updated successfully' })
  updateNotificationSettings(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.userService.updateNotificationSettings(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete my account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  deleteAccount(@CurrentUser() user: JwtAccessPayload) {
    return this.userService.deleteAccount(user.sub);
  }
}
