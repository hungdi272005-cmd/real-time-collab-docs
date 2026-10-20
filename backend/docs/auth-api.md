# Auth API

## Đăng ký

`POST /api/auth/register`

### Body

```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "password": "Password@123"
}
```

Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.

### Response thành công: `201`

```json
{
  "message": "Đăng ký tài khoản thành công!"
}
```

### Lỗi

- `400`: Thiếu field, email sai định dạng, mật khẩu yếu hoặc email đã tồn tại.

## Đăng nhập

`POST /api/auth/login`

### Body

```json
{
  "email": "nguyenvana@gmail.com",
  "password": "Password@123"
}
```

### Response thành công: `200`

```json
{
  "message": "Đăng nhập thành công",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "<USER_ID>",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com"
  }
}
```
