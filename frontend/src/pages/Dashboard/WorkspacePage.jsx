import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { workspaceApi } from "../../api/workspaceApi";
import "./Workspace.css";

// Trang bên trong một Workspace: tổng quan, tài liệu và hoạt động
const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("workspace");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await workspaceApi.getWorkspaces();
        const list = res.data.workspaces || [];
        const currentWorkspace = list.find((item) => item._id === id);
        if (currentWorkspace) {
          setWorkspace(currentWorkspace);
        } else {
          setError(
            "Không tìm thấy Workspace hoặc bạn không có quyền truy cập.",
          );
        }
      } catch (err) {
        setError(
          "Không thể tải thông tin Workspace. Vui lòng kiểm tra kết nối!",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const tabItems = [
    { id: "workspace", icon: "📊", label: "Tổng quan" },
    { id: "documents", icon: "📄", label: "Tài liệu" },
    { id: "activity", icon: "🕒", label: "Hoạt động" },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-header">
            <button
              className="sidebar-logo workspace-logo-button"
              onClick={() => navigate("/dashboard")}
            >
              <span className="logo-icon">📝</span>
              <span className="logo-text">SyncDoc</span>
            </button>
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate("/dashboard")}>
              <span className="item-icon">🏠</span>
              <span>Trang chủ</span>
            </button>
            <div className="workspace-sidebar-label">KHÔNG GIAN LÀM VIỆC</div>
            {tabItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
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
          <button className="workspace-logout" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="workspace-breadcrumb">
            <button onClick={() => navigate("/dashboard")}>
              Workspace của tôi
            </button>
            <span>/</span>
            <strong>{workspace?.name || "Workspace"}</strong>
          </div>
          <div className="workspace-top-user">
            <div className="user-avatar-circle">{userInitial}</div>
            <span>{user?.name}</span>
          </div>
        </header>

        <main className="dashboard-content-area workspace-content">
          {loading ? (
            <div className="workspace-message">
              Đang tải thông tin Workspace...
            </div>
          ) : error ? (
            <div className="workspace-message workspace-error">
              <h2>Không thể mở Workspace</h2>
              <p>{error}</p>
              <button
                className="create-workspace-btn"
                onClick={() => navigate("/dashboard")}
              >
                Quay lại trang chủ
              </button>
            </div>
          ) : (
            <>
              <div className="workspace-heading">
                <div className="workspace-heading-icon">📁</div>
                <div>
                  <div className="workspace-eyebrow">KHÔNG GIAN LÀM VIỆC</div>
                  <h1>{workspace.name}</h1>
                  <p>Nơi quản lý tài liệu và theo dõi hoạt động của nhóm.</p>
                </div>
              </div>

              <div className="workspace-tabs">
                {tabItems.map((item) => (
                  <button
                    key={item.id}
                    className={`workspace-tab ${activeTab === item.id ? "selected" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              {activeTab === "workspace" && (
                <section className="workspace-panel">
                  <div className="workspace-panel-title">
                    <div>
                      <h2>Tổng quan Workspace</h2>
                      <p>Thông tin chung về không gian làm việc của bạn.</p>
                    </div>
                    <span className="workspace-role-badge">Thành viên</span>
                  </div>
                  <div className="workspace-info-grid">
                    <div className="workspace-info-card">
                      <span className="info-card-icon">📄</span>
                      <div>
                        <p>Tài liệu</p>
                        <h3>0</h3>
                        <small>Tài liệu trong Workspace</small>
                      </div>
                    </div>
                    <div className="workspace-info-card">
                      <span className="info-card-icon">👥</span>
                      <div>
                        <p>Thành viên</p>
                        <h3>—</h3>
                        <small>Các thành viên trong nhóm</small>
                      </div>
                    </div>
                    <div className="workspace-info-card">
                      <span className="info-card-icon">🕒</span>
                      <div>
                        <p>Ngày tạo</p>
                        <h3>
                          {workspace.createdAt
                            ? new Date(workspace.createdAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "—"}
                        </h3>
                        <small>Thời điểm khởi tạo</small>
                      </div>
                    </div>
                  </div>
                  <div className="workspace-panel-title workspace-lower-title">
                    <div>
                      <h2>Bắt đầu làm việc</h2>
                      <p>Chọn khu vực bạn muốn truy cập.</p>
                    </div>
                  </div>
                  <div className="workspace-shortcuts">
                    <button onClick={() => setActiveTab("documents")}>
                      <span>📄</span>
                      <div>
                        <strong>Tài liệu</strong>
                        <small>Xem và quản lý tài liệu của nhóm</small>
                      </div>
                      <b>→</b>
                    </button>
                    <button onClick={() => setActiveTab("activity")}>
                      <span>🕒</span>
                      <div>
                        <strong>Hoạt động</strong>
                        <small>Theo dõi những thay đổi trong Workspace</small>
                      </div>
                      <b>→</b>
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "documents" && (
                <section className="workspace-panel">
                  <div className="workspace-panel-title">
                    <div>
                      <h2>Tài liệu</h2>
                      <p>Danh sách tài liệu thuộc Workspace này.</p>
                    </div>
                  </div>
                  <div className="workspace-search">
                    <span>🔍</span>
                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Tìm tài liệu..."
                    />
                  </div>
                  <div className="workspace-empty-state">
                    <div>📄</div>
                    <h3>
                      {searchText
                        ? "Không tìm thấy tài liệu phù hợp"
                        : "Chưa có tài liệu nào"}
                    </h3>
                    <p>
                      {searchText
                        ? "Thử tìm với từ khóa khác."
                        : "Tài liệu được tạo trong Workspace sẽ hiển thị tại đây."}
                    </p>
                  </div>
                </section>
              )}

              {activeTab === "activity" && (
                <section className="workspace-panel">
                  <div className="workspace-panel-title">
                    <div>
                      <h2>Hoạt động</h2>
                      <p>Lịch sử hoạt động gần đây trong Workspace.</p>
                    </div>
                  </div>
                  <div className="workspace-empty-state">
                    <div>🕒</div>
                    <h3>Chưa có hoạt động nào</h3>
                    <p>
                      Các hoạt động như tạo tài liệu hoặc chỉnh sửa nội dung sẽ
                      được hiển thị tại đây.
                    </p>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkspacePage;
