import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import { setupSwagger } from './config/swagger.js';

// Load biến môi trường từ file .env
dotenv.config();

const app = express();

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

export default app;
