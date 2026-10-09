# Real-Time Collaborative Document Editing System

## 1. Mô tả bài toán
Website cho phép các thành viên cùng tham gia một không gian làm việc, tạo tài liệu và chỉnh sửa tài liệu đó đồng thời theo thời gian thực. Hỗ trợ chat, quản lý thành viên và lưu lịch sử hoạt động.

## 2. Công nghệ sử dụng
- **Frontend:** React + Vite, Tiptap, Yjs, Y-Websocket
- **Backend:** Node.js + Express, Socket.IO, Yjs Provider
- **Database:** MongoDB (Mongoose)
- **Deployment:** Docker Compose

## 3. Cấu trúc dự án (Monorepo)
- `/frontend`: Code giao diện người dùng
- `/backend`: Code API và Real-time server
- `docker-compose.yml`: Cấu hình môi trường chạy
