import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import { createAppError } from '../utils/controllerError.js';

const ensureValidMemberIds = (workspaceId, userId) => {
  if (!mongoose.isValidObjectId(workspaceId) || !mongoose.isValidObjectId(userId)) {
    throw createAppError('workspaceId hoặc userId không hợp lệ', 400);
  }
};

const toMemberResponse = (membership, user) => ({
  id: membership._id,
  workspaceId: membership.workspaceId,
  userId: user?._id || membership.userId,
  name: user?.name,
  email: user?.email,
  role: membership.role,
  isActive: membership.isActive !== false,
  removedAt: membership.removedAt,
});

export const inviteMember = async (workspaceId, invitedUserId, inviterId) => {
  ensureValidMemberIds(workspaceId, invitedUserId);

  const invitedUser = await User.findById(invitedUserId).select('_id name email');
  if (!invitedUser) {
    throw createAppError('User cần mời không tồn tại', 404);
  }

  const existingMembership = await WorkspaceMember.findOne({
    workspaceId,
    userId: invitedUserId,
  });

  if (existingMembership) {
    if (existingMembership.isActive !== false) {
      throw createAppError('User đã là thành viên của Workspace', 409);
    }

    existingMembership.role = 'viewer';
    existingMembership.isActive = true;
    existingMembership.removedAt = null;
    await existingMembership.save();

    await Activity.create({
      workspaceId,
      userId: inviterId,
      action: 'REINVITED_MEMBER',
      targetId: invitedUser._id,
    });

    return {
      statusCode: 200,
      message: 'Mời lại thành viên thành công',
      member: toMemberResponse(existingMembership, invitedUser),
    };
  }

  const membership = await WorkspaceMember.create({
    workspaceId,
    userId: invitedUserId,
    role: 'viewer',
  });

  await Activity.create({
    workspaceId,
    userId: inviterId,
    action: 'INVITED_MEMBER',
    targetId: invitedUser._id,
  });

  return {
    statusCode: 201,
    message: 'Mời thành viên thành công',
    member: toMemberResponse(membership, invitedUser),
  };
};

export const getMembers = async (workspaceId) => {
  const members = await WorkspaceMember.find({
    workspaceId,
    isActive: { $ne: false },
  })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 });

  return members
    .filter((membership) => membership.userId)
    .map((membership) => toMemberResponse(membership, membership.userId));
};

export const updateMemberRole = async (workspaceId, userId, role, updaterId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createAppError('userId không hợp lệ', 400);
  }

  if (!['editor', 'viewer'].includes(role)) {
    throw createAppError('Role chỉ có thể là editor hoặc viewer', 400);
  }

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId,
    isActive: { $ne: false },
  });

  if (!membership) {
    throw createAppError('User không phải thành viên của Workspace', 404);
  }

  if (membership.role === 'owner') {
    throw createAppError('Không thể thay đổi role của owner', 403);
  }

  membership.role = role;
  await membership.save();

  await Activity.create({
    workspaceId,
    userId: updaterId,
    action: 'UPDATED_MEMBER_ROLE',
    targetId: membership.userId,
  });

  return {
    id: membership._id,
    workspaceId: membership.workspaceId,
    userId: membership.userId,
    role: membership.role,
  };
};

export const removeMember = async (workspaceId, userId, removerId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createAppError('userId không hợp lệ', 400);
  }

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId,
    isActive: { $ne: false },
  });

  if (!membership) {
    throw createAppError('User không phải thành viên của Workspace', 404);
  }

  if (membership.role === 'owner') {
    throw createAppError('Không thể xóa owner khỏi Workspace', 403);
  }

  membership.isActive = false;
  membership.removedAt = new Date();
  await membership.save();

  await Activity.create({
    workspaceId,
    userId: removerId,
    action: 'REMOVED_MEMBER',
    targetId: membership.userId,
  });

  return {
    userId,
    isActive: membership.isActive,
    removedAt: membership.removedAt,
  };
};
