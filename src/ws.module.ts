import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidate } from './common/config/env.validation';

import { LoggerModule } from './infrastructure/logger/logger.module';
import { JwtConfigModule } from './infrastructure/jwt/jwt-config.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { SocketGatewayModule } from './infrastructure/socket/socket-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: envValidate,
    }),

    LoggerModule,
    JwtConfigModule,
    RedisModule,
    SocketGatewayModule,
  ],
})
export class WsModule {}
