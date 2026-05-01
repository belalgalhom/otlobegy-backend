import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class ApiController {
  @Get()
  @Public()
  root() {
    return { message: 'ok' };
  }
}
