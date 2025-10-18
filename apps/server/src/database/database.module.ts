import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize:
          configService.getOrThrow<string>('NODE_ENV') === 'development',
        logging: configService.getOrThrow<string>('NODE_ENV') === 'development',
        autoLoadEntities: true,
        migrationsRun:
          configService.getOrThrow<string>('NODE_ENV') === 'production',
        extra: {
          ssl:
            configService.getOrThrow<string>('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
          max:
            configService.getOrThrow<string>('NODE_ENV') === 'production'
              ? 10
              : 5,
          min:
            configService.getOrThrow<string>('NODE_ENV') === 'production'
              ? 2
              : 1,
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 10000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
