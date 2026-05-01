import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.getOrThrow<string>('REDIS_URL');

    this.client = new Redis(url, {
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('connect', () =>
      this.logger.log('✅ Redis connection established'),
    );

    this.client.on('ready', () =>
      this.logger.log('🚀 Redis is ready to accept commands'),
    );

    this.client.on('reconnecting', () =>
      this.logger.warn('🔄 Redis reconnecting...'),
    );

    this.client.on('close', () =>
      this.logger.warn('🔌 Redis connection closed'),
    );

    this.client.on('error', (err: Error) =>
      this.logger.error(`❌ Redis error: ${err.message}`, err.stack),
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.logger.warn('Redis connection closing...');
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    try {
      await this.client.set(key, value, 'EX', ttl);
    } catch (error) {
      this.logger.error(`Failed to SET key "${key}"`, (error as Error).stack);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to GET key "${key}"`, (error as Error).stack);
      return null;
    }
  }

  async del(...keys: string[]): Promise<void> {
    try {
      await this.client.del(...keys);
    } catch (error) {
      this.logger.error(
        `Failed to DEL keys "${keys.join(', ')}"`,
        (error as Error).stack,
      );
    }
  }

  async exists(...keys: string[]): Promise<boolean> {
    try {
      const count = await this.client.exists(...keys);
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check EXISTS for keys "${keys.join(', ')}"`,
        (error as Error).stack,
      );
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key "${key}"`, (error as Error).stack);
      return -2;
    }
  }
}