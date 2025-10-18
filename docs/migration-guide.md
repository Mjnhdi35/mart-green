# Hướng Dẫn Migration Database

## Scripts Migration

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts",
  "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
  "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts",
  "migration:create": "typeorm-ts-node-commonjs migration:create",
  "schema:drop": "typeorm-ts-node-commonjs schema:drop -d src/database/data-source.ts"
}
```

## Cách Sử Dụng Migration

### 1. Generate Migration Từ Entity

```bash
# Tạo migration tự động từ entity changes
npm run migration:generate src/database/migrations/CreateUserTable
```

### 2. Chạy Migration

```bash
# Chạy tất cả pending migrations
npm run migration:run
```

### 3. Revert Migration (Nếu cần)

```bash
# Revert migration cuối cùng
npm run migration:revert
```

## Docker Compose

### docker-compose.yml

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: martgreen_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Chạy Docker Compose

```bash
# Khởi động database
docker-compose up -d

# Kiểm tra database
docker-compose ps
```

## Environment Variables

### Local Development

```bash
# .env file
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/martgreen_dev
NODE_ENV=development
```

### Production (Render/Neon)

```bash
# Production
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

## Commands Summary

```bash
# Generate migration từ entity
npm run migration:generate src/database/migrations/MigrationName

# Chạy migration
npm run migration:run

# Revert migration
npm run migration:revert

# Drop schema (chỉ development)
npm run schema:drop

# Docker compose
docker-compose up -d
```

## Workflow

1. **Development**: Chỉnh sửa entity
2. **Generate**: `npm run migration:generate`
3. **Test**: `npm run migration:run`
4. **Commit**: Commit migration files
5. **Deploy**: CI/CD tự động chạy migration trước khi deploy
