import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidate } from './common/config/env.validation';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { LoggerModule } from './infrastructure/logger/logger.module';

import { MailModule } from './infrastructure/mail/mail.module';
import { PushModule } from './infrastructure/push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: envValidate,
    }),
    LoggerModule,
    PrismaModule,
    QueueModule,
    MailModule.register({ enableWorker: true }),
    PushModule.register({ enableWorker: true }),
  ],
})
export class WorkerModule {}
