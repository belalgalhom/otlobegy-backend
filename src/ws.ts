import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsModule } from './ws.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from './infrastructure/socket/redis-io.adapter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(WsModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.enableShutdownHooks();

  app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    hidePoweredBy: true,
    xssFilter: true,
  }));

  app.enableCors();

  const configService = app.get(ConfigService);

  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  const port = configService.get<number>('WS_PORT') ?? 4000;

  app.set('trust proxy', 1);

  await app.listen(port);

  console.log(`🚀 WS server running on port ${port}`);
}

bootstrap();