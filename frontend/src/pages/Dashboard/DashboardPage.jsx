import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { workspaceApi } from "../../api/workspaceApi";
import "./Dashboard.css";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("overview");
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await workspaceApi.getWorkspaces();
      // Backend hiện tại trả về { message, workspaces: [...] }
      setWorkspaces(
        Array.isArray(res.data.workspaces) ? res.data.workspaces : [],
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách Workspace. Vui lòng kiểm tra backend và đăng nhập lại nếu cần.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    try {
      setCreating(true);
      const res = await workspaceApi.createWorkspace({
        name: workspaceName.trim(),
      });
      if (res.data.workspace) {
        setWorkspaces((oldWorkspaces) => [
          res.data.workspace,
          ...oldWorkspaces,
        ]);
      }
      setWorkspaceName("");
      setIsModalOpen(false);
      setCurrentPage("workspaces");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo Workspace!");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
    setCurrentPage("workspace-detail");
  };

  const goToPage = (page) => {
    setSelectedWorkspace(null);
    setCurrentPage(page);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const filteredWorkspaces = workspaces.filter((ws) =>
    (ws.name || "").toLowerCase().includes(searchText.toLowerCase()),
  );

  const navItems = [
    { id: "overview", icon: "📊", label: "Tổng quan" },
    { id: "workspaces", icon: "👥", label: "Workspace" },
    { id: "documents", icon: "📄", label: "Tài liệu" },
    { id: "activities", icon: "🕒", label: "Hoạt động" },
  ];

  const pageTitle = {
    overview: "Tổng quan",
    workspaces: "Workspace của tôi",
    documents: "Tài liệu",
    activities: "Hoạt động",
    "workspace-detail": selectedWorkspace?.name || "Workspace",
  }[currentPage];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">📝</span>
              <span className="logo-text">SyncDoc</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id || (currentPage === "workspace-detail" && item.id === "workspaces") ? "active" : ""}`}
                onClick={() => goToPage(item.id)}
              >
                <span className="item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
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

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm workspace..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="topbar-actions">
            <div className="profile-menu-container">
              <button
                className="profile-trigger-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="user-avatar-circle">{userInitial}</div>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {user?.name}
                </span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>▼</span>
              </button>
              {isProfileOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-name">{user?.name}</div>
                    <div className="dropdown-user-email">{user?.email}</div>
                  </div>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <span>🚪</span> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-content-area">
          {currentPage === "overview" && (
            <>
              <div className="welcome-banner">
                <div className="welcome-text">
                  <h1>Xin chào, {user?.name}! 👋</h1>
                  <p>
                    Chào mừng bạn trở lại. Bạn muốn tiếp tục dự án nào hôm nay?
                  </p>
                </div>
                <button
                  className="create-workspace-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span>➕</span> Tạo Workspace mới
                </button>
              </div>
              <section className="dashboard-section">
                <div className="section-title-row">
                  <h2>Workspace của tôi ({filteredWorkspaces.length})</h2>
                  <button
                    className="text-action-btn"
                    onClick={() => goToPage("workspaces")}
                  >
                    Xem tất cả →
                  </button>
                </div>
                {renderWorkspaceList()}
              </section>
              <section className="dashboard-section">
                <div className="section-title-row">
                  <h2>Tài liệu gần đây</h2>
                </div>
                <EmptyState
                  icon="📝"
                  title="Chưa có tài liệu nào gần đây"
                  description="Danh sách tài liệu sẽ hiển thị tại đây khi chức năng tài liệu được kết nối."
                />
              </section>
            </>
          )}

          {currentPage === "workspaces" && (
            <>
              <div className="page-heading-row">
                <div>
                  <h1>{pageTitle}</h1>
                  <p>Quản lý và mở các không gian làm việc của bạn.</p>
                </div>
                <button
                  className="create-workspace-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  ➕ Tạo Workspace mới
                </button>
              </div>
              {renderWorkspaceList()}
            </>
          )}

          {currentPage === "workspace-detail" && selectedWorkspace && (
            <>
              <button
                className="text-action-btn back-action"
                onClick={() => goToPage("workspaces")}
              >
                ← Quay lại Workspace
              </button>
              <div className="welcome-banner workspace-detail-banner">
                <div className="welcome-text">
                  <h1>📁 {selectedWorkspace.name}</h1>
                  <p>Không gian làm việc của bạn trên SyncDoc.</p>
                </div>
                <span className="workspace-role-badge">Workspace</span>
              </div>
              <div className="workspace-tabs">
                <button className="workspace-tab active">Tổng quan</button>
                <button
                  className="workspace-tab"
                  onClick={() => goToPage("documents")}
                >
                  📄 Tài liệu
                </button>
                <button
                  className="workspace-tab"
                  onClick={() => goToPage("activities")}
                >
                  🕒 Hoạt động
                </button>
              </div>
              <section className="dashboard-section">
                <div className="section-title-row">
                  <h2>Chào mừng đến với {selectedWorkspace.name}</h2>
                </div>
                <EmptyState
                  icon="🚀"
                  title="Workspace đã sẵn sàng"
                  description="Giao diện khu vực làm việc đã được tạo. Các chức năng tài liệu và lịch sử sẽ hiển thị khi backend cung cấp API tương ứng."
                />
              </section>
            </>
          )}

          {currentPage === "documents" && (
            <>
              <div className="page-heading-row">
                <div>
                  <h1>📄 Tài liệu</h1>
                  <p>Danh sách tài liệu trong các Workspace của bạn.</p>
                </div>
              </div>
              <EmptyState
                icon="📝"
                title="Chưa có dữ liệu tài liệu"
                description="Backend hiện tại chưa có API lấy danh sách tài liệu. Giao diện đã sẵn sàng để tích hợp sau."
              />
            </>
          )}

          {currentPage === "activities" && (
            <>
              <div className="page-heading-row">
                <div>
                  <h1>🕒 Hoạt động</h1>
                  <p>Theo dõi các hoạt động gần đây trong Workspace.</p>
                </div>
              </div>
              <EmptyState
                icon="📋"
                title="Chưa có dữ liệu hoạt động"
                description="Backend hiện tại chưa có API lấy lịch sử hoạt động. Phần này chỉ hiển thị trạng thái chờ dữ liệu."
              />
            </>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo Workspace mới</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label htmlFor="workspace-name">Tên Workspace</label>
                <input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Ví dụ: Đồ án nhóm"
                  required
                />
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
                  disabled={creating}
                >
                  {creating ? "Đang tạo..." : "Tạo Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderWorkspaceList() {
    if (loading)
      return (
        <div style={{ color: "#94a3b8", padding: "20px 0" }}>
          Đang tải danh sách Workspace...
        </div>
      );
    if (error)
      return (
        <div className="workspace-error">
          <p>{error}</p>
          <button className="btn-submit" onClick={fetchWorkspaces}>
            Thử tải lại
          </button>
        </div>
      );
    if (filteredWorkspaces.length === 0) {
      return (
        <EmptyState
          icon="📂"
          title={
            searchText
              ? "Không tìm thấy Workspace phù hợp"
              : "Bạn chưa tham gia Workspace nào"
          }
          description={
            searchText
              ? "Hãy thử từ khóa khác."
              : "Tạo Workspace đầu tiên để bắt đầu làm việc cùng nhóm."
          }
          action={
            !searchText ? (
              <button
                className="create-workspace-btn"
                onClick={() => setIsModalOpen(true)}
              >
                ➕ Tạo Workspace ngay
              </button>
            ) : null
          }
        />
      );
    }
    return (
      <div className="workspace-grid">
        {filteredWorkspaces.map((ws) => (
          <button
            type="button"
            key={ws._id}
            className="workspace-card"
            onClick={() => openWorkspace(ws)}
          >
            <div className="workspace-card-top">
              <div className="workspace-icon-box">📁</div>
              <div className="workspace-card-info">
                <div className="workspace-title">{ws.name}</div>
                <span className="workspace-role-badge">
                  Không gian làm việc
                </span>
              </div>
            </div>
            <div className="workspace-card-bottom">
              <span>
                Tạo ngày:{" "}
                {ws.createdAt
                  ? new Date(ws.createdAt).toLocaleDateString("vi-VN")
                  : "—"}
              </span>
              <span className="workspace-open-label">Mở Workspace →</span>
            </div>
          </button>
        ))}
      </div>
    );
  }
};

const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty-state-card">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
    {action || null}
  </div>
);

export default DashboardPage;
