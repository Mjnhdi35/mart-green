import { DataSource } from 'typeorm';

import { config } from 'dotenv';
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  extra: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: process.env.NODE_ENV === 'production' ? 10 : 5,
    min: process.env.NODE_ENV === 'production' ? 2 : 1,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  },
});
