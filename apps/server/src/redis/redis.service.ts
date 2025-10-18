import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      url: this.configService.getOrThrow('UPSTASH_REDIS_REST_URL'),
      token: this.configService.getOrThrow('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(
        `Redis SET error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.redis.get(key);
      return result as string | null;
    } catch (error) {
      this.logger.error(
        `Redis GET error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(
        `Redis DEL error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error(
        `Redis PING error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
