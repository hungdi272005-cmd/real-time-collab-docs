import mongoose from 'mongoose';
import WorkspaceMember from '../models/WorkspaceMember.js';

/**
 * Ensures that the authenticated user belongs to the workspace in the route.
 * Must run after authenticate.
 */
export const checkWorkspaceMember = async (req, res, next) => {
  const { workspaceId } = req.params;
  const userId = req.user?.id;

  if (!userId || !mongoose.isValidObjectId(workspaceId)) {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập Workspace' });
  }

  try {
    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      // $ne vẫn coi dữ liệu cũ chưa có isActive là đang hoạt động.
      isActive: { $ne: false },
    }).lean();

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập Workspace' });
    }

    req.membership = {
      workspaceId: membership.workspaceId,
      userId: membership.userId,
      role: membership.role,
    };

    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * Restricts a route to one or more workspace roles.
 * Must run after checkWorkspaceMember.
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.membership || !allowedRoles.includes(req.membership.role)) {
      return res.status(403).json({ message: 'Bạn không có đủ quyền thực hiện thao tác này' });
    }

    return next();
  };
};
