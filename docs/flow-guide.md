# 🚀 Hướng Dẫn CI/CD Flow

## 📋 Tổng Quan Flow

```
Dev push → develop (chỉ chạy test/lint/build, không deploy)
    ↓
Khi code ổn → PR merge develop → main
    ↓
CI/CD trigger → build & deploy production (server/web tách riêng)
```

## ✅ Ưu Điểm

- **Chạy CI/CD 1 lần trên main** → tiết kiệm thời gian & tài nguyên
- **Deploy production chỉ khi merge vào main** → an toàn, kiểm soát release rõ ràng
- **Web và Server tách pipeline** → build/deploy độc lập, song song

## 🔄 Chi Tiết Workflow

### 1) Develop Branch (`develop`)

- **Khi chạy**: push hoặc pull_request vào `develop`
- **Server (NestJS)**:
  - Node 20 + cache npm (theo package-lock)
  - `npm ci` → `npm run lint` → `npm run test -- --coverage` → `npm run build`
  - Upload artifact coverage (`server-coverage`)
- **Web (Nuxt/Vue)**:
  - Node 20 + cache npm (theo package-lock)
  - `npm ci` → `npm run lint --if-present` → `npm run test --if-present` → upload coverage (`web-coverage`) → `npm run build`
- ❌ Không deploy

### 2) Main Branch (`main`)

- **Khi chạy**: push hoặc pull_request vào `main` (hoặc chạy thủ công `workflow_dispatch`)
- **Server (ci-cd.yml)**:
  - Test: `npm install` → lint → test → build
  - Deploy (chỉ khi nhánh `main`):
    - Chạy migrations: `npm run migration:run` với `DATABASE_URL`, `NODE_ENV=production`
    - Build
    - Deploy Render: dùng `RENDER_SERVICE_ID`, `RENDER_API_KEY`
- **Web (web-ci-cd.yml)**:
  - Build: `npm install` → lint (if-present) → build
  - Deploy Render: dùng `RENDER_WEB_SERVICE_ID`, `RENDER_API_KEY`

## 📁 Các File Workflow

- `.github/workflows/develop-ci.yml` → CI cho develop (server + web, không deploy)
- `.github/workflows/ci-cd.yml` → Server production CI/CD (nhánh main)
- `.github/workflows/web-ci-cd.yml` → Web production CI/CD (nhánh main)

## 🎯 Best Practices

1. **Develop**: Push thường xuyên, test cục bộ trước
2. **Main**: Chỉ merge khi sẵn sàng release
3. **Hotfix**: Dùng `workflow_dispatch` để deploy khẩn cấp
4. **Giữ ổn định lockfile**: Ưu tiên `npm ci` trên CI để build tái lập
5. **Bảo mật**: Set đầy đủ secrets trên GitHub
