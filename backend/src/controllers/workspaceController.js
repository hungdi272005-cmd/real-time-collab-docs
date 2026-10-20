import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

// [POST] /api/workspaces - Tạo nhóm làm việc mới
export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id; // Lấy từ Middleware bảo vệ

    if (!name) {
      return res.status(400).json({ message: 'Vui lòng nhập tên nhóm làm việc' });
    }

    // 1. Tạo Workspace và lưu vào DB
    const newWorkspace = new Workspace({
      name,
      ownerId: userId
    });
    await newWorkspace.save();

    // 2. Thêm người tạo vào bảng Thành viên (WorkspaceMember) với quyền 'owner'
    const newMember = new WorkspaceMember({
      workspaceId: newWorkspace._id,
      userId: userId,
      role: 'owner'
    });
    await newMember.save();

    // 3. Lưu lịch sử hoạt động
    await Activity.create({
      workspaceId: newWorkspace._id,
      userId: userId,
      action: 'CREATED_WORKSPACE'
    });

    res.status(201).json({
      message: 'Tạo nhóm làm việc thành công',
      workspace: newWorkspace
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/workspaces - Lấy danh sách nhóm làm việc của tôi
export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Tìm trong bảng WorkspaceMember xem user này thuộc những nhóm nào
    // populate('workspaceId') giúp lấy luôn chi tiết thông tin của nhóm đó
    const memberships = await WorkspaceMember.find({ userId }).populate('workspaceId');
    
    // 2. Lọc ra danh sách nhóm để trả về
    const workspaces = memberships
      .filter(m => m.workspaceId)
      .map(m => ({
        ...m.workspaceId.toObject(),
        role: m.role,
      }));

    res.status(200).json({
      message: 'Lấy danh sách thành công',
      workspaces
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/workspaces/:workspaceId/activities - Lấy lịch sử hoạt động
export const getWorkspaceActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ workspaceId: req.params.workspaceId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      message: 'Lấy lịch sử hoạt động thành công',
      activities: activities.map(activity => ({
        id: activity._id,
        workspaceId: activity.workspaceId,
        user: activity.userId,
        action: activity.action,
        targetId: activity.targetId,
        createdAt: activity.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [POST] /api/workspaces/:workspaceId/members - Mời thành viên vào Workspace
export const inviteWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(workspaceId) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'workspaceId hoặc userId không hợp lệ' });
    }

    const invitedUser = await User.findById(userId).select('_id name email');
    if (!invitedUser) {
      return res.status(404).json({ message: 'User cần mời không tồn tại' });
    }

    const existingMembership = await WorkspaceMember.findOne({ workspaceId, userId });
    if (existingMembership) {
      if (existingMembership.isActive !== false) {
        return res.status(409).json({ message: 'User đã là thành viên của Workspace' });
      }

      existingMembership.role = 'viewer';
      existingMembership.isActive = true;
      existingMembership.removedAt = null;
      await existingMembership.save();

      await Activity.create({
        workspaceId,
        userId: req.user.id,
        action: 'REINVITED_MEMBER',
        targetId: invitedUser._id,
      });

      return res.status(200).json({
        message: 'Mời lại thành viên thành công',
        member: {
          id: existingMembership._id,
          workspaceId: existingMembership.workspaceId,
          userId: invitedUser._id,
          name: invitedUser.name,
          email: invitedUser.email,
          role: existingMembership.role,
          isActive: existingMembership.isActive,
          removedAt: existingMembership.removedAt,
        },
      });
    }

    // Không nhận role từ client: thành viên được mời luôn bắt đầu với viewer.
    const membership = await WorkspaceMember.create({
      workspaceId,
      userId,
      role: 'viewer',
    });

    await Activity.create({
      workspaceId,
      userId: req.user.id,
      action: 'INVITED_MEMBER',
      targetId: invitedUser._id,
    });

    return res.status(201).json({
      message: 'Mời thành viên thành công',
      member: {
        id: membership._id,
        workspaceId: membership.workspaceId,
        userId: invitedUser._id,
        name: invitedUser.name,
        email: invitedUser.email,
        role: membership.role,
        isActive: membership.isActive,
        removedAt: membership.removedAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User đã là thành viên của Workspace' });
    }

    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/workspaces/:workspaceId/members - Xem danh sách thành viên
export const getWorkspaceMembers = async (req, res) => {
  try {
    const members = await WorkspaceMember.find({
      workspaceId: req.params.workspaceId,
      isActive: { $ne: false },
    })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: 'Lấy danh sách thành viên thành công',
      members: members
        .filter(member => member.userId)
        .map(member => ({
          id: member._id,
          workspaceId: member.workspaceId,
          userId: member.userId._id,
          name: member.userId.name,
          email: member.userId.email,
          role: member.role,
          isActive: member.isActive !== false,
          removedAt: member.removedAt,
          createdAt: member.createdAt,
        })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [PATCH] /api/workspaces/:workspaceId/members/:userId/role - Đổi role thành viên
export const updateWorkspaceMemberRole = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }

    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Role chỉ có thể là editor hoặc viewer' });
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: { $ne: false },
    });
    if (!membership) {
      return res.status(404).json({ message: 'User không phải thành viên của Workspace' });
    }

    if (membership.role === 'owner') {
      return res.status(403).json({ message: 'Không thể thay đổi role của owner' });
    }

    membership.role = role;
    await membership.save();

    await Activity.create({
      workspaceId,
      userId: req.user.id,
      action: 'UPDATED_MEMBER_ROLE',
      targetId: membership.userId,
    });

    return res.status(200).json({
      message: 'Cập nhật role thành công',
      member: {
        id: membership._id,
        workspaceId: membership.workspaceId,
        userId: membership.userId,
        role: membership.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [DELETE] /api/workspaces/:workspaceId/members/:userId - Xóa thành viên
export const removeWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: { $ne: false },
    });
    if (!membership) {
      return res.status(404).json({ message: 'User không phải thành viên của Workspace' });
    }

    if (membership.role === 'owner') {
      return res.status(403).json({ message: 'Không thể xóa owner khỏi Workspace' });
    }

    membership.isActive = false;
    membership.removedAt = new Date();
    await membership.save();

    await Activity.create({
      workspaceId,
      userId: req.user.id,
      action: 'REMOVED_MEMBER',
      targetId: membership.userId,
    });

    return res.status(200).json({
      message: 'Xóa thành viên thành công',
      userId,
      isActive: membership.isActive,
      removedAt: membership.removedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/workspaces/:workspaceId/access-check
// Endpoint dùng để kiểm tra nhanh quyền thành viên trong quá trình phát triển.
export const checkWorkspaceAccess = (req, res) => {
  res.status(200).json({
    message: 'Có quyền truy cập Workspace',
    membership: req.membership,
  });
};

// [POST] /api/workspaces/:workspaceId/role-check
// Endpoint dùng để kiểm tra nhanh requireRole(['owner', 'editor']).
export const checkWorkspaceRole = (req, res) => {
  res.status(200).json({
    message: 'Role được phép thực hiện thao tác',
    membership: req.membership,
  });
};
