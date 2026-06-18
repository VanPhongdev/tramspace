# TramSpace - Không gian dành cho mọi người

TramSpace là một nền tảng mạng xã hội đang trong quá trình phát triển, với mục tiêu kết nối mọi người lại với nhau. Dự án hiện tại đã hoàn thiện các tính năng cốt lõi ban đầu của một nền tảng mạng xã hội với giao diện trực quan.

<img width="1918" height="1078" alt="image" src="https://github.com/user-attachments/assets/bbffa77e-7dcb-4317-91ae-6bc970f97f58" />

# Tính năng nổi bật đã hoàn thiện

- **Xác thực & Bảo mật:**
  - Đăng nhập và đăng ký tài khoản an toàn.
  - Sử dụng JSON Web Token (JWT) và Redis để xác thực.
- **Hồ sơ cá nhân (Profile):**
  - Quản lý thông tin cá nhân cơ bản.
  - Tải lên và thay đổi ảnh đại diện (Avatar), ảnh bìa (Cover).
- **Bài viết (Posts):**
  - Đăng bài viết mới trên bảng tin.
  - Hỗ trợ tải lên hình ảnh đa phương tiện kèm theo bài đăng.
- **Trang chủ (Home Feed):**
  - Hiển thị danh sách các bài viết mới nhất từ người dùng.

# Công nghệ sử dụng

# Frontend
- **Core:** React 19, Vite
- **Styling:** Pure CSS
- **Animation:** Framer Motion
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios

# Backend
- **Core:** Node.js, Express.js
- **Cơ sở dữ liệu:** PostgreSQL với Prisma ORM
- **Lưu trữ đa phương tiện:** Cloudinary (kết hợp với Multer để xử lý file)
- **Caching & Phiên đăng nhập:** Redis
- **Bảo mật:** JSON Web Token (JWT), bcryptjs, helmet, cors
- **Validation:** Zod

# Cấu trúc thư mục

```text
TramSpace/
├── backend/          # Chứa logic máy chủ, API và cấu hình database
│   ├── prisma/       # Cấu hình kết nối DB và định nghĩa lược đồ (schema.prisma)
│   ├── src/          # Mã nguồn backend (routes, controllers, services, middlewares)
│   └── server.js     # Điểm khởi chạy của backend
│
└── frontend/         # Chứa mã nguồn giao diện React
    ├── src/
    │   ├── components/ # Các thành phần giao diện tái sử dụng
    │   ├── pages/      # Các trang hiển thị (Home, Login, Register, Profile)
    │   └── lib/        # Cấu hình thư viện (axios instance, ...)
    └── index.html    # File gốc của ứng dụng frontend
```

# Hướng dẫn cài đặt và khởi chạy

# Yêu cầu hệ thống
- Node.js (phiên bản >= 18.x)
- PostgreSQL
- Redis
- Tài khoản Cloudinary

# Cài đặt Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường: Tạo file `.env` dựa trên các dịch vụ đang sử dụng:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/tramspace"
   JWT_SECRET="your_secret_key"
   REDIS_URL="redis://localhost:6379"
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   PORT=3000
   ```
4. Cập nhật cơ sở dữ liệu với Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Khởi chạy server:
   ```bash
   npm run dev
   ```

# Cài đặt Frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường: Tạo file `.env` để khai báo API backend (nếu cần):
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Khởi chạy giao diện web:
   ```bash
   npm run dev
   ```
