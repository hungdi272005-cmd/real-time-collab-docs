import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Document from '../models/Document.js';
import { createAppError } from '../utils/controllerError.js';

const documentQuery = (workspaceId, documentId) => ({
  _id: documentId,
  workspaceId,
});

const ensureValidDocumentId = (documentId) => {
  if (!mongoose.isValidObjectId(documentId)) {
    throw createAppError('documentId không hợp lệ', 400);
  }
};

const findActiveDocument = async (workspaceId, documentId) => {
  return Document.findOne({
    ...documentQuery(workspaceId, documentId),
    // Vẫn đọc được các document cũ chưa có trường isDeleted.
    isDeleted: { $ne: true },
  });
};

export const getDocuments = async (workspaceId) => {
  return Document.find({
    workspaceId,
    isDeleted: { $ne: true },
  })
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });
};

export const getDocument = async (workspaceId, documentId, role) => {
  ensureValidDocumentId(documentId);

  const document = await findActiveDocument(workspaceId, documentId);
  if (!document) {
    throw createAppError('Không tìm thấy tài liệu trong Workspace', 404);
  }

  await document.populate('createdBy', 'name email');

  return {
    document,
    role,
    isEditable: ['owner', 'editor'].includes(role),
  };
};

export const createDocument = async (workspaceId, userId, rawTitle) => {
  const title = rawTitle === undefined
    ? 'Untitled Document'
    : typeof rawTitle === 'string'
      ? rawTitle.trim()
      : null;

  if (title === null) {
    throw createAppError('Tên tài liệu phải là chuỗi', 400);
  }

  if (!title) {
    throw createAppError('Tên tài liệu không được để trống', 400);
  }

  const document = await Document.create({
    workspaceId,
    title,
    createdBy: userId,
    isDeleted: false,
    deletedAt: null,
  });

  await Activity.create({
    workspaceId,
    userId,
    action: 'CREATED_DOCUMENT',
    targetId: document._id,
  });

  return document;
};

export const renameDocument = async (workspaceId, documentId, userId, rawTitle) => {
  ensureValidDocumentId(documentId);

  const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
  if (!title) {
    throw createAppError('Tên tài liệu không được để trống', 400);
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
    throw createAppError('Không tìm thấy tài liệu trong Workspace', 404);
  }

  await Activity.create({
    workspaceId,
    userId,
    action: 'RENAMED_DOCUMENT',
    targetId: document._id,
  });

  return document;
};

export const deleteDocument = async (workspaceId, documentId, userId) => {
  ensureValidDocumentId(documentId);

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
    throw createAppError('Không tìm thấy tài liệu trong Workspace', 404);
  }

  await Activity.create({
    workspaceId,
    userId,
    action: 'DELETED_DOCUMENT',
    targetId: document._id,
  });

  return document;
};
