import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express'; 
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors();

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    hidePoweredBy: true,
    xssFilter: true,
  }));
  
  app.set('trust proxy', 1);

  const port = configService.get<number>('API_PORT') ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();