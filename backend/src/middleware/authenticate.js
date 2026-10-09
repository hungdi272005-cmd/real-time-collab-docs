import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    // 1. Lấy token từ header (Định dạng: "Bearer <chuỗi_token>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực, vui lòng đăng nhập' });
    }

    // Cắt bỏ chữ "Bearer " để lấy đúng chuỗi mã
    const token = authHeader.split(' ')[1];

    // 2. Giải mã token bằng Secret Key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Đính kèm ID của user vào request để hàm Controller phía sau sử dụng
    req.user = { id: decoded.userId };
    
    // Cho phép đi qua cổng bảo vệ
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn phiên đăng nhập' });
  }
};
