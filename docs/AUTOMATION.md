# Automated CI/CD Pipeline - MartGreen

## Tự động hóa hoàn toàn quy trình Development → Production

### 🚀 Workflow tự động

1. **Development**:

   - Push code lên `develop` → Chạy tests
   - Tạo Pull Request → Chạy tests

2. **Production**:
   - Merge vào `main` → Tests + Auto Deploy via GitHub Actions
   - Manual trigger → Có thể deploy bất cứ lúc nào

### 📋 Cần setup trên GitHub

#### 1. GitHub Secrets

Vào **Settings** > **Secrets and variables** > **Actions**:

```
RENDER_API_KEY = your-render-api-key
RENDER_SERVICE_ID = your-render-service-id
```

#### 2. Branch Protection Rules

Vào **Settings** > **Branches** > Add rule cho `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

### 🔧 Render Configuration (Tạo qua UI)

#### Service Settings:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Node Version**: 20.x
- **Root Directory**: `apps/server`

#### Environment Variables (Set trên Render Dashboard):

```
NODE_ENV = production
PORT = 10000
DATABASE_URL = [tự động từ Render PostgreSQL]
UPSTASH_REDIS_REST_URL = [từ Upstash dashboard]
UPSTASH_REDIS_REST_TOKEN = [từ Upstash dashboard]
```

### 🎯 Quy trình hoạt động

#### Khi push lên develop:

```bash
git checkout develop
git add .
git commit -m "feat: new feature"
git push origin develop
```

→ GitHub Actions chạy tests (không deploy)

#### Khi tạo Pull Request:

```bash
# Tạo PR từ develop → main
```

→ GitHub Actions chạy tests
→ Nếu pass → Có thể merge

#### Khi merge vào main:

```bash
git checkout main
git merge develop
git push origin main
```

→ GitHub Actions chạy tests + deploy lên Render (qua GitHub Actions)

#### Manual Deploy:

- Vào **Actions** tab trên GitHub
- Chọn **CI/CD Pipeline**
- Click **Run workflow**

### 📊 Monitoring

#### GitHub Actions:

- Vào **Actions** tab để xem logs
- Kiểm tra status của từng job
- Xem deployment logs

#### Render Dashboard:

- Vào [Render Dashboard](https://dashboard.render.com)
- Kiểm tra deployment status
- Xem application logs

### 🔍 Troubleshooting

#### GitHub Actions fails:

1. Kiểm tra secrets có đúng không
2. Xem logs trong Actions tab
3. Kiểm tra Node.js version compatibility

#### Render deployment fails:

1. Kiểm tra build command
2. Kiểm tra environment variables
3. Xem logs trong Render dashboard

#### Tests fail:

1. Chạy tests local: `npm test`
2. Kiểm tra linting: `npm run lint`
3. Fix issues và push lại

### 🎉 Benefits

- ✅ **Tự động testing** trên mọi push
- ✅ **Tự động deploy** khi merge main (qua GitHub Actions)
- ✅ **Branch protection** đảm bảo code quality
- ✅ **Manual trigger** khi cần deploy ngay
- ✅ **Full monitoring** qua GitHub và Render
