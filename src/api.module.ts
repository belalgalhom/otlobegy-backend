import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidate } from './common/config/env.validation';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ApiController } from './api.controller';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { JwtConfigModule } from './infrastructure/jwt/jwt-config.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { SocketModule } from './infrastructure/socket/socket.module';
import { AppCacheModule } from './infrastructure/cache/cache.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { EventsModule } from './infrastructure/events/events.module';
import { RateLimiterModule } from './infrastructure/rate-limiter/rate-limiter.module';

import { MailModule } from './infrastructure/mail/mail.module';
import { PushModule } from './infrastructure/push/push.module';

import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { VerifiedGuard } from './common/guards/verified.guard';

import { AuthModule } from './features/auth/auth.module';
import { DevicesModule } from './features/devices/devices.module';
import { UsersModule } from './features/users/users.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { ChatModule } from './features/chat/chat.module';
import { InboxModule } from './features/inbox/inbox.module';
import { CustomersModule } from './features/customers/customers.module';
import { ZonesModule } from './features/zones/zones.module';
import { TicketsModule } from './features/tickets/tickets.module';
import { VendorsModule } from './features/vendors/vendors.module';
import { PlatformSettingsModule } from './features/platform-settings/platform-settings.module';

import { ListenersModule } from './common/listeners/listener.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: envValidate,
    }),
    PrismaModule,
    LoggerModule,
    JwtConfigModule,
    QueueModule,
    RedisModule,
    SocketModule,
    StorageModule,
    AppCacheModule,
    RateLimiterModule,
    EventsModule,
    MailModule.register({ enableWorker: false }),
    PushModule.register({ enableWorker: false }),

    AuthModule,
    DevicesModule,
    UsersModule,
    ChatModule,
    NotificationsModule,
    InboxModule,
    CustomersModule,
    ZonesModule,
    TicketsModule,
    VendorsModule,
    PlatformSettingsModule,

    ListenersModule,
  ],
  controllers: [ApiController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: VerifiedGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ApiModule {}