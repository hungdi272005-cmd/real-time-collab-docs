# Backend API Documentation

Tài liệu mô tả các API của backend cho frontend và các thành viên trong nhóm.

## Thông tin chung

- Base URL khi chạy local: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/api-docs/`
- Định dạng request/response: `application/json`
- Các API yêu cầu đăng nhập dùng header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Danh sách tài liệu

- [Auth API](./auth-api.md)
- [Workspace API](./workspace-api.md)
- [Member API](./member-api.md)
- [Document API](./document-api.md)
- [Activity API](./activity-api.md)

## Quy ước quyền

| Role | Quyền chính |
| --- | --- |
| `owner` | Quản lý workspace, member, document |
| `editor` | Xem, tạo, đổi tên và xóa document; có thể mời member |
| `viewer` | Xem workspace, member, document và activity |

`isEditable` là trường được tính trong response của API mở tài liệu. Trường này là `true` với `owner`/`editor` và `false` với `viewer`; không lưu thành một field riêng trong database.

## Mã lỗi thường gặp

| Mã | Ý nghĩa |
| --- | --- |
| `400` | Dữ liệu gửi lên không hợp lệ |
| `401` | Thiếu hoặc sai JWT token |
| `403` | Không có quyền truy cập hoặc không đủ role |
| `404` | Không tìm thấy tài nguyên |
| `409` | Tài nguyên đã tồn tại |
| `500` | Lỗi server |
