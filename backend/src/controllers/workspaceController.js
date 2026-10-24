import {
  getWorkspaceActivities as getActivities,
  getUserWorkspaces as getWorkspaces,
  createWorkspace as createWorkspaceService,
} from '../services/workspaceService.js';
import {
  getMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
} from '../services/workspaceMemberService.js';
import { sendControllerError } from '../utils/controllerError.js';

// [POST] /api/workspaces - Tạo nhóm làm việc mới
export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Vui lòng nhập tên nhóm làm việc' });
    }

    const workspace = await createWorkspaceService(name, req.user.id);

    return res.status(201).json({
      message: 'Tạo nhóm làm việc thành công',
      workspace,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [GET] /api/workspaces - Lấy danh sách nhóm làm việc của tôi
export const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await getWorkspaces(req.user.id);

    return res.status(200).json({
      message: 'Lấy danh sách thành công',
      workspaces,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [GET] /api/workspaces/:workspaceId/activities - Lấy lịch sử hoạt động
export const getWorkspaceActivities = async (req, res) => {
  try {
    const activities = await getActivities(req.params.workspaceId);

    return res.status(200).json({
      message: 'Lấy lịch sử hoạt động thành công',
      activities,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [POST] /api/workspaces/:workspaceId/members - Mời thành viên vào Workspace
export const inviteWorkspaceMember = async (req, res) => {
  try {
    const result = await inviteMember(
      req.params.workspaceId,
      req.body.userId,
      req.user.id
    );

    return res.status(result.statusCode).json({
      message: result.message,
      member: result.member,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [GET] /api/workspaces/:workspaceId/members - Xem danh sách thành viên
export const getWorkspaceMembers = async (req, res) => {
  try {
    const members = await getMembers(req.params.workspaceId);

    return res.status(200).json({
      message: 'Lấy danh sách thành viên thành công',
      members,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [PATCH] /api/workspaces/:workspaceId/members/:userId/role - Đổi role thành viên
export const updateWorkspaceMemberRole = async (req, res) => {
  try {
    const member = await updateMemberRole(
      req.params.workspaceId,
      req.params.userId,
      req.body.role,
      req.user.id
    );

    return res.status(200).json({
      message: 'Cập nhật role thành công',
      member,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [DELETE] /api/workspaces/:workspaceId/members/:userId - Xóa thành viên
export const removeWorkspaceMember = async (req, res) => {
  try {
    const result = await removeMember(
      req.params.workspaceId,
      req.params.userId,
      req.user.id
    );

    return res.status(200).json({
      message: 'Xóa thành viên thành công',
      ...result,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [GET] /api/workspaces/:workspaceId/access-check
export const checkWorkspaceAccess = (req, res) => {
  res.status(200).json({
    message: 'Có quyền truy cập Workspace',
    membership: req.membership,
  });
};

// [POST] /api/workspaces/:workspaceId/role-check
export const checkWorkspaceRole = (req, res) => {
  res.status(200).json({
    message: 'Role được phép thực hiện thao tác',
    membership: req.membership,
  });
};
