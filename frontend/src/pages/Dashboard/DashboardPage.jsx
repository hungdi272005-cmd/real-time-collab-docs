import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import './Dashboard.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State quản lý danh sách Workspace
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State Modal tạo Workspace
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);

  // State Profile Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Lấy danh sách workspace từ Backend khi tải trang
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await workspaceApi.getWorkspaces();
      // res.data có cấu trúc: { message: "...", workspaces: [...] }
      setWorkspaces(res.data.workspaces || []);
    } catch (err) {
      setError('Không thể tải danh sách Workspace. Vui lòng kiểm tra kết nối!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tạo Workspace mới
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    try {
      setCreating(true);
      const res = await workspaceApi.createWorkspace({ name: workspaceName.trim() });
      // Thêm workspace mới vừa tạo vào danh sách
      if (res.data.workspace) {
        setWorkspaces([res.data.workspace, ...workspaces]);
      }
      setWorkspaceName('');
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi tạo Workspace!');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Lấy chữ cái đầu làm Avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="dashboard-layout">
      {/* ========================================= */}
      {/* 1. THANH BÊN (SIDEBAR)                   */}
      {/* ========================================= */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">📝</span>
              <span className="logo-text">SyncDoc</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">
              <span className="item-icon">📊</span>
              <span>Tổng quan</span>
            </button>
            <button className="nav-item">
              <span className="item-icon">👥</span>
              <span>Workspace</span>
            </button>
            <button className="nav-item">
              <span className="item-icon">📄</span>
              <span>Tài liệu</span>
            </button>
            <button className="nav-item">
              <span className="item-icon">🕒</span>
              <span>Hoạt động</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-avatar-circle">{userInitial}</div>
            <div className="user-info-text">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================= */}
      {/* 2. NỘI DUNG CHÍNH (MAIN AREA)             */}
      {/* ========================================= */}
      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-topbar">
          <div className="search-box">
            <span>🔍</span>
            <input type="text" placeholder="Tìm kiếm workspace, tài liệu..." />
          </div>

          <div className="topbar-actions">
            <div className="profile-menu-container">
              <button
                className="profile-trigger-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="user-avatar-circle">{userInitial}</div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{user?.name}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>▼</span>
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-name">{user?.name}</div>
                    <div className="dropdown-user-email">{user?.email}</div>
                  </div>
                  <button className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <span>⚙️</span> Cài đặt tài khoản
                  </button>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <span>🚪</span> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Khu vực cuộn dữ liệu */}
        <main className="dashboard-content-area">
          {/* Lời chào & Nút Tạo Workspace */}
          <div className="welcome-banner">
            <div className="welcome-text">
              <h1>Xin chào, {user?.name}! 👋</h1>
              <p>Chào mừng bạn trở lại. Bạn muốn tiếp tục dự án nào hôm nay?</p>
            </div>
            <button className="create-workspace-btn" onClick={() => setIsModalOpen(true)}>
              <span>➕</span> Tạo Workspace mới
            </button>
          </div>

          {/* Danh sách Workspace của tôi */}
          <section className="dashboard-section">
            <div className="section-title-row">
              <h2>Workspace của tôi ({workspaces.length})</h2>
            </div>

            {loading ? (
              <div style={{ color: '#94a3b8', padding: '20px 0' }}>Đang tải danh sách Workspace...</div>
            ) : error ? (
              <div style={{ color: '#f87171', padding: '20px 0' }}>{error}</div>
            ) : workspaces.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-icon">📂</div>
                <h3>Bạn chưa tham gia Workspace nào</h3>
                <p>Khởi tạo nhóm làm việc đầu tiên để bắt đầu mời các thành viên và tạo tài liệu!</p>
                <button className="create-workspace-btn" onClick={() => setIsModalOpen(true)}>
                  <span>➕</span> Tạo Workspace ngay
                </button>
              </div>
            ) : (
              <div className="workspace-grid">
                {workspaces.map((ws) => (
                  <div key={ws._id} className="workspace-card">
                    <div className="workspace-card-top">
                      <div className="workspace-icon-box">📁</div>
                      <div>
                        <div className="workspace-title">{ws.name}</div>
                        <span className="workspace-role-badge">Chủ nhóm</span>
                      </div>
                    </div>
                    <div className="workspace-card-bottom">
                      <span>Tạo ngày: {new Date(ws.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span style={{ color: '#60a5fa', fontWeight: '600' }}>Vào nhóm →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tài liệu gần đây (Khung chuẩn bị cho tính năng sau) */}
          <section className="dashboard-section">
            <div className="section-title-row">
              <h2>Tài liệu gần đây</h2>
            </div>
            <div className="empty-state-card" style={{ padding: '28px 20px' }}>
              <div className="empty-state-icon" style={{ fontSize: '32px' }}>📝</div>
              <h3>Chưa có tài liệu nào gần đây</h3>
              <p>Khi bạn tạo hoặc chỉnh sửa văn bản trong Workspace, tài liệu sẽ hiển thị tại đây.</p>
            </div>
          </section>
        </main>
      </div>

      {/* ========================================= */}
      {/* 3. MODAL TẠO WORKSPACE MỚI                */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo Workspace Mới</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateWorkspace}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="ws-name">Tên nhóm làm việc (Workspace)</label>
                  <input
                    type="text"
                    id="ws-name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="VD: Nhóm Đồ Án KTPM, Dự án Web..."
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={creating || !workspaceName.trim()}
                >
                  {creating ? 'Đang tạo...' : 'Tạo ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
