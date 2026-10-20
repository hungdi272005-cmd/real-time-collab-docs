import express from 'express';
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceActivities,
  inviteWorkspaceMember,
  getWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  checkWorkspaceAccess,
  checkWorkspaceRole,
} from '../controllers/workspaceController.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  checkWorkspaceMember,
  requireRole,
} from '../middleware/workspaceAuthorization.js';

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

/**
 * @swagger
 * /api/workspaces/{workspaceId}/activities:
 *   get:
 *     summary: Lấy lịch sử hoạt động của Workspace
 *     description: Trả về tối đa 50 hoạt động gần nhất của Workspace.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Workspace
 *     responses:
 *       200:
 *         description: Lấy lịch sử hoạt động thành công
 *       401:
 *         description: Token không hợp lệ hoặc chưa đăng nhập
 *       403:
 *         description: User không thuộc Workspace
 */
router.get(
  '/:workspaceId/activities',
  authenticate,
  checkWorkspaceMember,
  getWorkspaceActivities
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   post:
 *     summary: Mời thành viên vào Workspace
 *     description: Người được mời luôn được tạo với role viewer. Người gọi phải có role owner hoặc editor.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của user cần mời
 *                 example: 6ac909992e019286024b16cd5
 *     responses:
 *       201:
 *         description: Mời thành viên mới thành công
 *       200:
 *         description: Kích hoạt lại thành viên đã bị xóa mềm
 *       400:
 *         description: workspaceId hoặc userId không hợp lệ
 *       401:
 *         description: Token không hợp lệ hoặc chưa đăng nhập
 *       403:
 *         description: Không phải thành viên hoặc không đủ quyền
 *       404:
 *         description: User cần mời không tồn tại
 *       409:
 *         description: User đã là thành viên
 */
router.post(
  '/:workspaceId/members',
  authenticate,
  checkWorkspaceMember,
  requireRole(['owner', 'editor']),
  inviteWorkspaceMember
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   get:
 *     summary: Xem danh sách thành viên Workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách thành viên
 *       403:
 *         description: Không có quyền truy cập Workspace
 */
router.get(
  '/:workspaceId/members',
  authenticate,
  checkWorkspaceMember,
  getWorkspaceMembers
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{userId}/role:
 *   patch:
 *     summary: Cập nhật role thành viên
 *     description: Chỉ owner được đổi role. Không thể đổi role owner.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [editor, viewer]
 *     responses:
 *       200:
 *         description: Cập nhật role thành công
 *       403:
 *         description: Không đủ quyền hoặc target là owner
 */
router.patch(
  '/:workspaceId/members/:userId/role',
  authenticate,
  checkWorkspaceMember,
  requireRole(['owner']),
  updateWorkspaceMemberRole
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{userId}:
 *   delete:
 *     summary: Xóa mềm thành viên khỏi Workspace
 *     description: Chỉ owner được xóa thành viên và không thể xóa owner. Bản ghi vẫn được giữ lại để có thể mời lại.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành viên thành công
 *       403:
 *         description: Không đủ quyền hoặc target là owner
 */
router.delete(
  '/:workspaceId/members/:userId',
  authenticate,
  checkWorkspaceMember,
  requireRole(['owner']),
  removeWorkspaceMember
);

// Các endpoint kiểm thử quyền Workspace.
// Có thể xoá sau khi đã gắn middleware vào các API tài liệu/thành viên thật.
/**
 * @swagger
 * /api/workspaces/{workspaceId}/access-check:
 *   get:
 *     summary: Kiểm tra user có thuộc Workspace hay không
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Workspace
 *     responses:
 *       200:
 *         description: User là thành viên của Workspace
 *       401:
 *         description: Token không hợp lệ hoặc chưa đăng nhập
 *       403:
 *         description: User không có quyền truy cập Workspace
 */
router.get(
  '/:workspaceId/access-check',
  authenticate,
  checkWorkspaceMember,
  checkWorkspaceAccess
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/role-check:
 *   post:
 *     summary: Kiểm tra role owner/editor có được phép thao tác hay không
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Workspace
 *     responses:
 *       200:
 *         description: Role được phép thao tác
 *       401:
 *         description: Token không hợp lệ hoặc chưa đăng nhập
 *       403:
 *         description: Không phải thành viên hoặc role không đủ quyền
 */
router.post(
  '/:workspaceId/role-check',
  authenticate,
  checkWorkspaceMember,
  requireRole(['owner', 'editor']),
  checkWorkspaceRole
);

export default router;
