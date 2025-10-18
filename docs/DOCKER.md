# Docker Compose Setup - MartGreen Server

Hướng dẫn sử dụng Docker Compose để chạy MartGreen Server với PostgreSQL và Redis.

## Yêu cầu hệ thống

- Docker và Docker Compose đã cài đặt

## Cấu hình môi trường

### 1. Tạo file environment

```bash
cd apps/server
cp env.example .env
```

### 2. Cấu hình biến môi trường

Chỉnh sửa file `.env`:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/martgreen_dev

# Redis Configuration
REDIS_URL=redis://redis:6379

# Application Configuration
NODE_ENV=development
PORT=3000
```

## Chạy ứng dụng

### Development (Local)

```bash
# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

### Production (Render)

Ứng dụng đã được deploy lên Render với:

- **Web Service**: NestJS Server
- **PostgreSQL**: Render PostgreSQL (Free tier)
- **Redis**: Render Redis (Free tier)

## Truy cập services

- **NestJS Server**: http://localhost:3000 (local) hoặc Render URL
- **PostgreSQL**: Internal Docker network only (local)
- **Redis**: Internal Docker network only (local)

## Các lệnh hữu ích

```bash
# Rebuild và start services
docker-compose up --build

# Restart service cụ thể
docker-compose restart server

# Vào container để debug
docker-compose exec server sh
docker-compose exec postgres psql -U postgres -d martgreen_dev
docker-compose exec redis redis-cli

# Xem status containers
docker-compose ps

# Dừng và xóa volumes (xóa data)
docker-compose down -v
```

## Troubleshooting

### Port conflicts

Nếu port 3000 đã được sử dụng, sửa trong `docker-compose.yml`:

```yaml
ports:
  - "3001:3000" # Thay đổi port host
```

### Database connection issues

- Đảm bảo PostgreSQL container đã start hoàn toàn trước khi server start
- Kiểm tra logs: `docker-compose logs postgres`

### Permission issues

Trên Linux/macOS, có thể cần chạy với `sudo`:

```bash
sudo docker-compose up -d
```

### Clean up

```bash
# Xóa tất cả containers, networks, volumes
docker-compose down -v --remove-orphans

# Reset hoàn toàn
docker system prune -a
```

## Services trong Docker Compose

- **postgres**: postgres:15-alpine, internal only
- **redis**: redis:7-alpine, internal only
- **server**: Build từ Dockerfile, port 3000:3000

## CI/CD với GitHub Actions

Project sử dụng GitHub Actions để tự động deploy lên Render:

1. **Push code** lên main branch
2. **GitHub Actions** tự động build và test
3. **Render** tự động deploy từ GitHub repository
4. **Environment variables** được cấu hình trên Render dashboard

### Render Configuration

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Node Version**: 20.x
- **Environment**: Production

## Development Workflow

1. **Local Development**: Sử dụng Docker Compose
2. **Code Changes**: Push lên GitHub
3. **Auto Deploy**: Render tự động deploy
4. **Testing**: Test trên production URL
