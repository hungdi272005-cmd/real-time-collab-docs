import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import { setupSwagger } from './config/swagger.js';

// Load biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Giúp đọc được JSON gửi lên từ Client

// Thiết lập Swagger UI
setupSwagger(app);

// Đăng ký API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Route mặc định kiểm tra server
app.get('/', (req, res) => {
  res.send('API Server is running... Truy cập /api-docs để xem tài liệu API.');
});

// Kết nối MongoDB và Khởi động Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📖 Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
