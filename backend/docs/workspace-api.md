# Workspace API

Tất cả API trong tài liệu này yêu cầu JWT token, trừ khi ghi chú khác.

## Tạo workspace

`POST /api/workspaces`

```json
{
  "name": "Nhóm đồ án"
}
```

Người tạo workspace được thêm tự động với role `owner`.

## Lấy danh sách workspace của tôi

`GET /api/workspaces`

Trả về các workspace mà user hiện tại đang là thành viên hoạt động, kèm role của user.

## Kiểm tra quyền truy cập workspace

`GET /api/workspaces/{workspaceId}/access-check`

API kiểm tra user hiện tại có thuộc workspace hay không. Đây là endpoint kiểm tra quyền, có thể dùng khi debug hoặc kiểm thử middleware.

## Kiểm tra role thao tác

`POST /api/workspaces/{workspaceId}/role-check`

Chỉ `owner` và `editor` được nhận response thành công. Đây là endpoint kiểm thử middleware `requireRole`.

## Mẫu lỗi không có quyền

```json
{
  "message": "Bạn không có quyền thực hiện thao tác này"
}
```
