import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Activity from '../models/Activity.js';

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
    const workspaces = memberships.map(m => m.workspaceId);

    res.status(200).json({
      message: 'Lấy danh sách thành công',
      workspaces
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
