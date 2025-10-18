import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    RedisModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
