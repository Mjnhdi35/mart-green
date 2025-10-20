# 🚀 CI/CD Flow Guide

## 📋 Flow Overview

```
Dev push → develop (CI optional, chỉ chạy test/lint, không deploy)
    ↓
Khi code ổn → PR merge develop → main
    ↓
CI/CD trigger → build & deploy production
```

## ✅ Ưu điểm

- **Chạy CI/CD chính xác 1 lần** → tiết kiệm thời gian & tài nguyên
- **Deploy production chỉ khi merge vào main** → an toàn, kiểm soát release rõ ràng

## 🔄 Workflow Details

### 1. Develop Branch (`develop`)

- **Trigger**: Push to `develop` branch
- **Actions**:
  - ✅ Run tests
  - ✅ Run linting
  - ✅ Build (test only)
  - ❌ **NO DEPLOY**

### 2. Main Branch (`main`)

- **Trigger**: Push to `main` branch (usually from PR merge)
- **Actions**:
  - ✅ Run tests
  - ✅ Run linting
  - ✅ Build application
  - ✅ **DEPLOY TO PRODUCTION**

## 📁 Workflow Files

- `develop-ci.yml` - CI for develop branch (test/lint only)
- `ci-cd.yml` - Production CI/CD for server
- `web-ci-cd.yml` - Production CI/CD for web

## 🎯 Best Practices

1. **Develop**: Push frequently, test locally
2. **Main**: Only merge when ready for production
3. **Hotfix**: Use `workflow_dispatch` for emergency deploys
