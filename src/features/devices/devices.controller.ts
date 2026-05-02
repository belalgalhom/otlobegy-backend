import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/device.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Devices - Push Notifications')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a device for push notifications' })
  @ApiResponse({ status: 201, description: 'Device registered successfully' })
  async register(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    await this.deviceService.register(userId, dto);
    return { message: 'common.success.operation' };
  }

  @Delete(':token')
  @ApiOperation({ summary: 'Remove a device token' })
  @ApiResponse({ status: 200, description: 'Device token removed successfully' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('token') token: string,
  ) {
    await this.deviceService.remove(userId, token);
    return { message: 'common.success.operation' };
  }
}
