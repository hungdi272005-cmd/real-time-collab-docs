# Workspace Member API

## Mời thành viên

`POST /api/workspaces/{workspaceId}/members`

Chỉ `owner` và `editor` được mời thành viên. Role gửi từ client không được chấp nhận; thành viên mới luôn là `viewer`.

```json
{
  "userId": "<USER_ID>"
}
```

Response thành công trả về `201` và member có `role: "viewer"`. Nếu mời lại member đã bị xóa mềm, member được kích hoạt lại và trả về `200`.

## Xem danh sách thành viên

`GET /api/workspaces/{workspaceId}/members`

Mọi thành viên đang hoạt động, bao gồm `viewer`, đều được xem danh sách member.

## Cập nhật role

`PATCH /api/workspaces/{workspaceId}/members/{userId}/role`

Chỉ `owner` được đổi role. Không thể đổi role của owner. Role hợp lệ là `editor` hoặc `viewer`.

```json
{
  "role": "editor"
}
```

## Xóa thành viên

`DELETE /api/workspaces/{workspaceId}/members/{userId}`

Chỉ `owner` được xóa member và không thể xóa chính owner. Đây là xóa mềm: bản ghi vẫn còn trong collection `workspacemembers`, nhưng được cập nhật:

```json
{
  "isActive": false,
  "removedAt": "<DATE>"
}
```

Member đã bị xóa mềm không còn được xem là thành viên trong các API khác.
