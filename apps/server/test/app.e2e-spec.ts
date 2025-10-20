import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { HealthController } from '../src/health/health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisService } from '../src/redis/redis.service';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({ status: 'ok' }),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest
              .fn()
              .mockResolvedValue({ database: { status: 'up' } }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            ping: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/health/db (GET)', () => {
    return request(app.getHttpServer()).get('/health/db').expect(200);
  });

  it('/health/redis (GET)', () => {
    return request(app.getHttpServer()).get('/health/redis').expect(200);
  });

  it('/health/all (GET)', () => {
    return request(app.getHttpServer()).get('/health/all').expect(200);
  });
});
