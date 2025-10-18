# GitHub Actions CI/CD Setup

## Cấu hình GitHub Secrets

Để GitHub Actions có thể deploy lên Render, bạn cần thêm các secrets sau:

### 1. RENDER_API_KEY

- Vào [Render Dashboard](https://dashboard.render.com/)
- Vào **Account Settings** > **API Keys**
- Tạo API Key mới
- Copy và thêm vào GitHub Secrets

### 2. RENDER_SERVICE_ID

- Vào service của bạn trên Render
- Copy **Service ID** từ URL hoặc settings
- Thêm vào GitHub Secrets

## Cách thêm GitHub Secrets

1. Vào repository GitHub
2. Vào **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Thêm:
   - Name: `RENDER_API_KEY`
   - Value: API key từ Render
5. Thêm:
   - Name: `RENDER_SERVICE_ID`
   - Value: Service ID từ Render

## Workflow hoạt động

### Khi push code lên main branch:

1. **Test Job**: Chạy linting, tests, build
2. **Deploy Job**: Tự động deploy lên Render (nếu test pass)

### Khi tạo Pull Request:

1. **Test Job**: Chỉ chạy tests (không deploy)

## Render Configuration

### Build Settings

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Node Version**: 20.x
- **Root Directory**: `apps/server`

### Environment Variables trên Render

- `NODE_ENV`: `production`
- `DATABASE_URL`: Connection string từ Render PostgreSQL
- `REDIS_URL`: Connection string từ Render Redis

## Branch Strategy

### Development Workflow

1. **Push code** lên branch `develop` → Chạy tests
2. **Tạo Pull Request** từ `develop` → `main` → Chạy tests
3. **Merge** vào `main` → Tự động deploy lên Render

### Branch Protection Rules (Khuyến nghị)

1. Vào **Settings** > **Branches**
2. Thêm rule cho branch `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

## Workflow hoạt động

### Khi push code lên develop branch:

1. **Test Job**: Chạy linting, tests, build
2. **Không deploy** (chỉ test)

### Khi push code lên main branch:

1. **Test Job**: Chạy linting, tests, build
2. **Deploy Job**: Tự động deploy lên Render (nếu test pass)

### Khi tạo Pull Request:

1. **Test Job**: Chỉ chạy tests (không deploy)

## Troubleshooting

### GitHub Actions fails

- Kiểm tra secrets đã được thêm đúng chưa
- Kiểm tra Service ID có đúng không
- Xem logs trong GitHub Actions tab

### Render deployment fails

- Kiểm tra build command có đúng không
- Kiểm tra environment variables
- Xem logs trong Render dashboard
