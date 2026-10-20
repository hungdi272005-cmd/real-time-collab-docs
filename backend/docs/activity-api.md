# Activity API

## Lấy lịch sử hoạt động của workspace

`GET /api/workspaces/{workspaceId}/activities`

Mọi member đang hoạt động đều được xem tối đa 50 hoạt động gần nhất. Dữ liệu được lấy từ collection `activities` và sắp xếp mới nhất trước.

### Response thành công: `200`

```json
{
  "message": "Lấy lịch sử hoạt động thành công",
  "activities": [
    {
      "id": "<ACTIVITY_ID>",
      "workspaceId": "<WORKSPACE_ID>",
      "user": {
        "_id": "<USER_ID>",
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@gmail.com"
      },
      "action": "CREATED_DOCUMENT",
      "targetId": "<DOCUMENT_ID>",
      "createdAt": "<DATE>"
    }
  ]
}
```

Activity hiện được ghi khi tạo workspace, tạo/đổi tên/xóa document và thao tác quản lý member.
