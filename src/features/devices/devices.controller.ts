import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/device.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @Post()
  async register(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    await this.deviceService.register(userId, dto);
    return { message: 'common.success.operation' };
  }

  @Delete(':token')
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('token') token: string,
  ) {
    await this.deviceService.remove(userId, token);
    return { message: 'common.success.operation' };
  }
}
