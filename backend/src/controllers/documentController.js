import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Document from '../models/Document.js';

const isValidId = (value) => mongoose.isValidObjectId(value);

const documentQuery = (workspaceId, documentId) => ({
  _id: documentId,
  workspaceId,
});

// [GET] /api/workspaces/:workspaceId/documents
export const getWorkspaceDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      workspaceId: req.params.workspaceId,
      // $ne vẫn lấy được các document cũ chưa có trường isDeleted.
      isDeleted: { $ne: true },
    })
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      message: 'Lấy danh sách tài liệu thành công',
      documents,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/workspaces/:workspaceId/documents/:documentId
export const getWorkspaceDocument = async (req, res) => {
  try {
    const { workspaceId, documentId } = req.params;
    if (!isValidId(documentId)) {
      return res.status(400).json({ message: 'documentId không hợp lệ' });
    }

    const document = await Document.findOne({
      ...documentQuery(workspaceId, documentId),
      isDeleted: { $ne: true },
    })
      .populate('createdBy', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu trong Workspace' });
    }

    return res.status(200).json({
      message: 'Lấy tài liệu thành công',
      document,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [POST] /api/workspaces/:workspaceId/documents
export const createWorkspaceDocument = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const title = req.body.title === undefined
      ? 'Untitled Document'
      : typeof req.body.title === 'string'
        ? req.body.title.trim()
        : null;

    if (title === null) {
      return res.status(400).json({ message: 'Tên tài liệu phải là chuỗi' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Tên tài liệu không được để trống' });
    }

    const document = await Document.create({
      workspaceId,
      title,
      createdBy: req.user.id,
      isDeleted: false,
      deletedAt: null,
    });

    await Activity.create({
      workspaceId,
      userId: req.user.id,
      action: 'CREATED_DOCUMENT',
      targetId: document._id,
    });

    return res.status(201).json({
      message: 'Tạo tài liệu thành công',
      document,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [PATCH] /api/workspaces/:workspaceId/documents/:documentId
export const renameWorkspaceDocument = async (req, res) => {
  try {
    const { workspaceId, documentId } = req.params;
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';

    if (!isValidId(documentId)) {
      return res.status(400).json({ message: 'documentId không hợp lệ' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Tên tài liệu không được để trống' });
    }

    const document = await Document.findOneAndUpdate(
      {
        ...documentQuery(workspaceId, documentId),
        isDeleted: { $ne: true },
      },
      { title },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu trong Workspace' });
    }

    await Activity.create({
      workspaceId,
      userId: req.user.id,
      action: 'RENAMED_DOCUMENT',
      targetId: document._id,
    });

    return res.status(200).json({
      message: 'Đổi tên tài liệu thành công',
      document,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [DELETE] /api/workspaces/:workspaceId/documents/:documentId
export const deleteWorkspaceDocument = async (req, res) => {
  try {
    const { workspaceId, documentId } = req.params;
    if (!isValidId(documentId)) {
      return res.status(400).json({ message: 'documentId không hợp lệ' });
    }

    const document = await Document.findOneAndUpdate(
      {
        ...documentQuery(workspaceId, documentId),
        isDeleted: { $ne: true },
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu trong Workspace' });
    }

    await Activity.create({
      workspaceId,
      userId: req.user.id,
      action: 'DELETED_DOCUMENT',
      targetId: document._id,
    });

    return res.status(200).json({
      message: 'Xóa tài liệu thành công',
      documentId,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
