import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableShutdownHooks();

  console.log('🚀 Worker is running and listening for jobs...');
}

void bootstrap().catch((err) => {
  console.error('WORKER failed to start:', err);
  process.exit(1);
});
