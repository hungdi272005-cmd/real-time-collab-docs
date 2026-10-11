import axiosClient from './axiosClient';

export const workspaceApi = {
  // Lấy danh sách workspace mà người dùng tham gia
  getWorkspaces: () => {
    return axiosClient.get('/workspaces');
  },

  // Tạo workspace mới
  createWorkspace: (data) => {
    return axiosClient.post('/workspaces', data);
  },
};
