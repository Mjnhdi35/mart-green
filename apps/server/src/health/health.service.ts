import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';
import {
  HealthConfig,
  defaultHealthConfig,
  developmentHealthConfig,
} from './health.config';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private healthCheckCache = new Map<
    string,
    { result: any; timestamp: number }
  >();
  private config: HealthConfig;

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private redis: RedisService,
    private configService: ConfigService,
  ) {
    this.config = this.isProduction()
      ? defaultHealthConfig
      : developmentHealthConfig;
  }

  async performHealthCheck(
    type: 'full' | 'database' | 'redis' | 'http' | 'memory' | 'disk',
  ): Promise<any> {
    const cacheKey = `${type}-health-check`;

    if (this.config.features.enableCaching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      let result: any;

      switch (type) {
        case 'full':
          result = await this.performFullHealthCheck();
          break;
        case 'database':
          result = await this.performDatabaseHealthCheck();
          break;
        case 'redis':
          result = await this.performRedisHealthCheck();
          break;
        case 'http':
          result = await this.performHttpHealthCheck();
          break;
        case 'memory':
          result = await this.performMemoryHealthCheck();
          break;
        case 'disk':
          result = await this.performDiskHealthCheck();
          break;
        default:
          throw new Error(`Unknown health check type: ${type}`);
      }

      if (this.config.features.enableCaching) {
        this.setCachedResult(cacheKey, result);
      }

      return result;
    } catch (error) {
      this.logger.error(`${type} health check failed:`, error);
      throw error;
    }
  }

  private async performFullHealthCheck(): Promise<any> {
    const checks = [
      // Database health check
      () =>
        this.db.pingCheck('database', {
          timeout: this.config.timeouts.database,
        }),

      // Redis health check
      () => this.checkRedisWithTimeout(),

      // Memory health check (if enabled)
      ...(this.config.features.enableMemoryCheck
        ? [
            () =>
              this.memory.checkHeap(
                'memory_heap',
                this.config.thresholds.memory.heap * 1024 * 1024,
              ),
            () =>
              this.memory.checkRSS(
                'memory_rss',
                this.config.thresholds.memory.rss * 1024 * 1024,
              ),
          ]
        : []),

      // Disk health check (if enabled)
      ...(this.config.features.enableDiskCheck
        ? [
            () =>
              this.disk.checkStorage('storage', {
                path: '/',
                thresholdPercent: this.config.thresholds.disk.thresholdPercent,
              }),
          ]
        : []),

      // HTTP health check (if enabled and in production)
      ...(this.config.features.enableHttpCheck && this.isProduction()
        ? [
            () =>
              this.http.pingCheck(
                'mart-green',
                'https://mart-green.onrender.com',
                {
                  timeout: this.config.timeouts.http,
                },
              ),
          ]
        : []),
    ];

    return this.health.check(checks);
  }

  private async performDatabaseHealthCheck(): Promise<any> {
    return this.health.check([
      () =>
        this.db.pingCheck('database', {
          timeout: this.config.timeouts.database,
        }),
    ]);
  }

  private async performRedisHealthCheck(): Promise<any> {
    return this.health.check([() => this.checkRedisWithTimeout()]);
  }

  private async performHttpHealthCheck(): Promise<any> {
    if (!this.config.features.enableHttpCheck || !this.isProduction()) {
      return { status: 'disabled', message: 'HTTP health check disabled' };
    }

    return this.health.check([
      () =>
        this.http.pingCheck('mart-green', 'https://mart-green.onrender.com', {
          timeout: this.config.timeouts.http,
        }),
    ]);
  }

  private async performMemoryHealthCheck(): Promise<any> {
    if (!this.config.features.enableMemoryCheck) {
      return { status: 'disabled', message: 'Memory health check disabled' };
    }

    return this.health.check([
      () =>
        this.memory.checkHeap(
          'memory_heap',
          this.config.thresholds.memory.heap * 1024 * 1024,
        ),
      () =>
        this.memory.checkRSS(
          'memory_rss',
          this.config.thresholds.memory.rss * 1024 * 1024,
        ),
    ]);
  }

  private async performDiskHealthCheck(): Promise<any> {
    if (!this.config.features.enableDiskCheck) {
      return { status: 'disabled', message: 'Disk health check disabled' };
    }

    return this.health.check([
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: this.config.thresholds.disk.thresholdPercent,
        }),
    ]);
  }

  private async checkRedisWithTimeout(): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Redis health check timeout'));
      }, this.config.timeouts.redis);

      this.checkRedis()
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  private async checkRedis(): Promise<any> {
    const isHealthy = await this.redis.ping();
    return {
      redis: {
        status: isHealthy ? 'up' : 'down',
        message: isHealthy ? 'Redis is healthy' : 'Redis is unhealthy',
      },
    } as any;
  }

  private getCachedResult(key: string): any | null {
    const cached = this.healthCheckCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.cache.ttl) {
      return cached.result;
    }
    return null;
  }

  private setCachedResult(key: string, result: any): void {
    // Implement cache size limit
    if (this.healthCheckCache.size >= this.config.cache.maxSize) {
      const firstKey = this.healthCheckCache.keys().next().value;
      if (firstKey) {
        this.healthCheckCache.delete(firstKey);
      }
    }

    this.healthCheckCache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  private isProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  clearCache(): void {
    this.healthCheckCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.healthCheckCache.size,
      keys: Array.from(this.healthCheckCache.keys()),
    };
  }
}
