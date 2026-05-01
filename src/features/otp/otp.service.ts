import { Injectable } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/redis.service';
import * as crypto from 'crypto';

export type OtpPurpose = 'VERIFICATION' | 'PASSWORD_RESET';

@Injectable()
export class OtpService {
  constructor(private redis: RedisService) {}

  async generateOtp(
    identifier: string,
    purpose: OtpPurpose = 'VERIFICATION',
  ): Promise<string> {
    const code = crypto.randomInt(100000, 999999).toString();
    const key = `otp:${purpose.toLowerCase()}:${identifier}`;

    await this.redis.set(key, code, 900);

    return code;
  }

  async validateOtp(
    identifier: string,
    code: string,
    purpose: OtpPurpose = 'VERIFICATION',
  ): Promise<boolean> {
    const key = `otp:${purpose.toLowerCase()}:${identifier}`;
    const storedCode = await this.redis.get(key);

    if (!storedCode || storedCode !== code) return false;

    await this.redis.del(key);
    return true;
  }

  async peekOtp(
    identifier: string,
    code: string,
    purpose: OtpPurpose = 'VERIFICATION',
  ): Promise<boolean> {
    const key = `otp:${purpose.toLowerCase()}:${identifier}`;
    const storedCode = await this.redis.get(key);
    return storedCode === code;
  }

  async deleteOtp(
    identifier: string,
    purpose: OtpPurpose = 'VERIFICATION',
  ): Promise<void> {
    const key = `otp:${purpose.toLowerCase()}:${identifier}`;
    await this.redis.del(key);
  }
}
