import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../core/decorators/public.decorator';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisService,
  ) {}

  @Get('db')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  @Get('redis')
  @HealthCheck()
  checkRedis() {
    return this.health.check([
      async () => {
        const isHealthy = await this.redis.ping();
        return { redis: { status: isHealthy ? 'up' : 'down' } };
      },
    ]);
  }

  @Public()
  @Get('all')
  @HealthCheck()
  checkAll() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      async () => {
        const isHealthy = await this.redis.ping();
        return { redis: { status: isHealthy ? 'up' : 'down' } };
      },
    ]);
  }
}
