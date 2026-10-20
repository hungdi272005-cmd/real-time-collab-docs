import express from 'express';
import {
  createWorkspaceDocument,
  deleteWorkspaceDocument,
  getWorkspaceDocument,
  getWorkspaceDocuments,
  renameWorkspaceDocument,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  checkWorkspaceMember,
  requireRole,
} from '../middleware/workspaceAuthorization.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: API quản lý tài liệu trong Workspace
 */

/**
 * @swagger
 * /api/workspaces/{workspaceId}/documents:
 *   get:
 *     summary: Lấy danh sách tài liệu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách tài liệu }
 *       403: { description: Không có quyền truy cập Workspace }
 */
router.get('/', authenticate, checkWorkspaceMember, getWorkspaceDocuments);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/documents:
 *   post:
 *     summary: Tạo tài liệu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tài liệu đầu tiên
 *     responses:
 *       201: { description: Tạo tài liệu thành công }
 *       403: { description: Không đủ quyền, cần owner hoặc editor }
 */
router.post(
  '/',
  authenticate,
  checkWorkspaceMember,
  requireRole(['owner', 'editor']),
  createWorkspaceDocument
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/documents/{documentId}:
 *   get:
 *     summary: Mở một tài liệu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lấy tài liệu thành công và trả về quyền chỉnh sửa của user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document: { type: object }
 *                 role: { type: string, enum: [owner, editor, viewer] }
 *                 isEditable: { type: boolean, example: true }
 *       403: { description: Không có quyền truy cập Workspace }
 *       404: { description: Không tìm thấy tài liệu }
 */
router.get(
  '/:documentId',
  authenticate,
  checkWorkspaceMember,
  getWorkspaceDocument
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/documents/{documentId}:
 *   patch:
 *     summary: Đổi tên tài liệu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tài liệu đã đổi tên
 *     responses:
 *       200: { description: Đổi tên tài liệu thành công }
 *       403: { description: Không đủ quyền, cần owner hoặc editor }
 */
router.patch(
  '/:documentId',
  authenticate,
  checkWorkspaceMember,
  requireRole(['owner', 'editor']),
  renameWorkspaceDocument
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/documents/{documentId}:
 *   delete:
 *     summary: Xóa tài liệu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Xóa tài liệu thành công }
 *       403: { description: Không đủ quyền, cần owner hoặc editor }
 */
router.delete(
  '/:documentId',
  authenticate,
  checkWorkspaceMember,
  requireRole(['owner', 'editor']),
  deleteWorkspaceDocument
);

export default router;
