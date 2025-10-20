# Auth module tests

Các test đơn vị (unit tests) quan trọng đã được thêm cho module `auth` tại `apps/server/test/`:

- AuthService (`apps/server/test/auth.service.spec.ts`)

  - register
    - Trả lỗi khi mật khẩu và xác nhận không khớp
    - Trả lỗi khi email đã tồn tại
    - Tạo user mới, trả `{ accessToken, refreshToken }`, lưu refresh token vào Redis với key `auth:refresh:<userId>` và TTL tương ứng
  - login
    - Trả lỗi khi thông tin đăng nhập không hợp lệ
    - Trả `{ accessToken, refreshToken }` khi hợp lệ và lưu refresh token vào Redis
  - refreshToken
    - Verify refresh token bằng `JWT_REFRESH_SECRET`, kiểm tra đối chiếu với Redis, sau đó rotate và trả cặp token mới
    - Trả lỗi khi refresh token không khớp giá trị đang lưu trong Redis
  - me
    - Trả về thông tin user theo `userId`
  - logout
    - Xoá refresh token đang lưu trong Redis và trả `{ message: 'Logged out successfully' }`

- AuthController (`apps/server/test/auth.controller.spec.ts`)
  - register/login/refresh: gọi tới service tương ứng với payload nhận vào
  - me/logout: sử dụng `@CurrentUser()` để đọc `user.id` và uỷ quyền cho service

Ghi chú triển khai:

- Các test dùng mock cho `UsersService`, `PasswordHasher`, `JwtService`, `ConfigService`, `RedisService` nên không phụ thuộc vào database/Redis thật.
- JWT payload sử dụng chuẩn `sub` (subject). Access token ký bằng secret mặc định của ứng dụng, refresh token ký bằng `JWT_REFRESH_SECRET` và có TTL dài hơn. Refresh token được lưu/kiểm tra/rotate qua Upstash Redis.

Chạy test:

```bash
# chạy trong thư mục apps/server
$ yarn test --runInBand
```

Các biến môi trường cần thiết khi chạy app (test không cần vì đã mock): `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN` (vd `15m`), `JWT_REFRESH_EXPIRES_IN` (vd `7d`), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SALT_ROUNDS`.
