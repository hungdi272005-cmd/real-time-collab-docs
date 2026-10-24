import {
  createDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  renameDocument,
} from '../services/documentService.js';
import { sendControllerError } from '../utils/controllerError.js';

// [GET] /api/workspaces/:workspaceId/documents
export const getWorkspaceDocuments = async (req, res) => {
  try {
    const documents = await getDocuments(req.params.workspaceId);

    return res.status(200).json({
      message: 'Lấy danh sách tài liệu thành công',
      documents,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [GET] /api/workspaces/:workspaceId/documents/:documentId
export const getWorkspaceDocument = async (req, res) => {
  try {
    const result = await getDocument(
      req.params.workspaceId,
      req.params.documentId,
      req.membership.role
    );

    return res.status(200).json({
      message: 'Lấy tài liệu thành công',
      ...result,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [POST] /api/workspaces/:workspaceId/documents
export const createWorkspaceDocument = async (req, res) => {
  try {
    const document = await createDocument(
      req.params.workspaceId,
      req.user.id,
      req.body.title
    );

    return res.status(201).json({
      message: 'Tạo tài liệu thành công',
      document,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [PATCH] /api/workspaces/:workspaceId/documents/:documentId
export const renameWorkspaceDocument = async (req, res) => {
  try {
    const document = await renameDocument(
      req.params.workspaceId,
      req.params.documentId,
      req.user.id,
      req.body.title
    );

    return res.status(200).json({
      message: 'Đổi tên tài liệu thành công',
      document,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// [DELETE] /api/workspaces/:workspaceId/documents/:documentId
export const deleteWorkspaceDocument = async (req, res) => {
  try {
    await deleteDocument(
      req.params.workspaceId,
      req.params.documentId,
      req.user.id
    );

    return res.status(200).json({
      message: 'Xóa tài liệu thành công',
      documentId: req.params.documentId,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};
