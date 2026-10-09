import express from 'express';
import { createWorkspace, getUserWorkspaces } from '../controllers/workspaceController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: API Quản lý nhóm làm việc
 */

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Tạo nhóm làm việc mới
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nhóm Đồ Án KTPM
 *     responses:
 *       201:
 *         description: Tạo nhóm làm việc thành công
 *       400:
 *         description: Thiếu thông tin
 *       401:
 *         description: Bị chặn (Chưa gửi Token hoặc Token sai)
 */
router.post('/', authenticate, createWorkspace);

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Lấy danh sách nhóm làm việc của tôi
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách workspace
 *       401:
 *         description: Bị chặn (Chưa gửi Token hoặc Token sai)
 */
router.get('/', authenticate, getUserWorkspaces);

export default router;
