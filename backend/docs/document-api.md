# Document API

Document được lưu trong collection `documents`. Các API đọc chỉ trả về document chưa bị xóa mềm (`isDeleted != true`).

## Lấy danh sách tài liệu

`GET /api/workspaces/{workspaceId}/documents`

Mọi member đang hoạt động đều được gọi API này.

## Mở chi tiết tài liệu

`GET /api/workspaces/{workspaceId}/documents/{documentId}`

Response có thêm role và quyền chỉnh sửa của user hiện tại:

```json
{
  "message": "Lấy tài liệu thành công",
  "document": {},
  "role": "editor",
  "isEditable": true
}
```

`isEditable` là `true` với `owner`/`editor`, và `false` với `viewer`.

## Tạo tài liệu

`POST /api/workspaces/{workspaceId}/documents`

Chỉ `owner` hoặc `editor` được tạo tài liệu.

```json
{
  "title": "Tài liệu mới"
}
```

Nếu bỏ qua `title`, backend dùng tên mặc định `Untitled Document`.

## Đổi tên tài liệu

`PATCH /api/workspaces/{workspaceId}/documents/{documentId}`

Chỉ `owner` hoặc `editor` được đổi tên.

```json
{
  "title": "Tên tài liệu mới"
}
```

## Xóa tài liệu

`DELETE /api/workspaces/{workspaceId}/documents/{documentId}`

Chỉ `owner` hoặc `editor` được xóa. Đây là xóa mềm, không xóa document khỏi MongoDB:

```json
{
  "isDeleted": true,
  "deletedAt": "<DATE>"
}
```

## Các action được ghi vào Activity

- `CREATED_DOCUMENT`
- `RENAMED_DOCUMENT`
- `DELETED_DOCUMENT`
