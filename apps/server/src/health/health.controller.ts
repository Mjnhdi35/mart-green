import { Controller, Get, Post } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.healthService.performHealthCheck('full');
  }

  @Get('db')
  @HealthCheck()
  async checkDatabase() {
    return this.healthService.performHealthCheck('database');
  }

  @Get('http')
  @HealthCheck()
  async checkHttp() {
    return this.healthService.performHealthCheck('http');
  }

  @Get('redis')
  @HealthCheck()
  async checkRedisOnly() {
    return this.healthService.performHealthCheck('redis');
  }

  @Get('memory')
  @HealthCheck()
  async checkMemory() {
    return this.healthService.performHealthCheck('memory');
  }

  @Get('disk')
  @HealthCheck()
  async checkDisk() {
    return this.healthService.performHealthCheck('disk');
  }

  @Get('cache/stats')
  getCacheStats() {
    return this.healthService.getCacheStats();
  }

  @Post('cache/clear')
  clearCache() {
    this.healthService.clearCache();
    return { message: 'Health check cache cleared successfully' };
  }
}
