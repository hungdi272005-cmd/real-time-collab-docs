import Activity from '../models/Activity.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export const createWorkspace = async (name, userId) => {
  const workspace = await Workspace.create({
    name,
    ownerId: userId,
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId,
    role: 'owner',
  });

  await Activity.create({
    workspaceId: workspace._id,
    userId,
    action: 'CREATED_WORKSPACE',
  });

  return workspace;
};

export const getUserWorkspaces = async (userId) => {
  const memberships = await WorkspaceMember.find({ userId }).populate('workspaceId');

  return memberships
    .filter((membership) => membership.workspaceId)
    .map((membership) => ({
      ...membership.workspaceId.toObject(),
      role: membership.role,
    }));
};

export const getWorkspaceActivities = async (workspaceId) => {
  const activities = await Activity.find({ workspaceId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

  return activities.map((activity) => ({
    id: activity._id,
    workspaceId: activity.workspaceId,
    user: activity.userId,
    action: activity.action,
    targetId: activity.targetId,
    createdAt: activity.createdAt,
  }));
};
