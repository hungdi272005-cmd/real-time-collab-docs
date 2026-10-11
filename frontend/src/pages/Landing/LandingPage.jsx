import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="landing-wrapper">
      {/* 1. Thanh điều hướng (Navbar) */}
      <header className="landing-navbar">
        <div className="nav-container">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">📝</span>
            <span className="logo-text">SyncDoc</span>
          </Link>

          <nav className="nav-links">
            <a href="#features">Tính năng</a>
            <a href="#how-it-works">Cách hoạt động</a>
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Vào Không Gian Làm Việc ({user?.name})
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Bắt đầu miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">✨ Nền tảng soạn thảo cộng tác thời gian thực</div>
          <h1 className="hero-title">
            Cùng viết. Cùng trao đổi.<br />
            <span className="highlight-text">Cùng hoàn thành.</span>
          </h1>
          <p className="hero-desc">
            Xây dựng không gian làm việc tập trung cho nhóm. Tạo tài liệu trực tuyến, đồng bộ chỉnh sửa tức thì và trao đổi liền mạch mà không lo mất nội dung.
          </p>
          <div className="hero-cta-group">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              {isAuthenticated ? "Đến Trang Làm Việc" : "Bắt đầu miễn phí ngay"} →
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-secondary btn-lg">
                Đăng nhập tài khoản
              </Link>
            )}
          </div>
        </div>

        {/* Minh họa Mockup Trình soạn thảo trực quan */}
        <div className="hero-mockup-wrapper">
          <div className="mockup-window">
            <div className="mockup-header">
              <div className="window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mockup-title">Kế hoạch phát triển dự án.doc</div>
              <div className="active-avatars">
                <span className="avatar avatar-1" title="Nguyễn Văn A (Đang sửa)">A</span>
                <span className="avatar avatar-2" title="Trần Văn B (Online)">B</span>
                <span className="badge-live">● Đang đồng bộ</span>
              </div>
            </div>

            <div className="mockup-body">
              <div className="editor-sim">
                <p className="line-1"><strong>1. Mục tiêu cốt lõi:</strong></p>
                <p className="line-2">
                  Xây dựng hệ thống cho phép nhiều thành viên cùng gõ đồng thời trên một tài liệu...
                </p>
                {/* Con trỏ người dùng minh họa Yjs */}
                <div className="user-cursor cursor-blue">
                  <span className="cursor-flag">Nguyễn Văn A</span>
                </div>
                <p className="line-3">
                  Sử dụng công nghệ Yjs (CRDT) và Socket.IO để dữ liệu đạt độ trễ thấp nhất.
                </p>
                <div className="user-cursor cursor-green">
                  <span className="cursor-flag">Trần Văn B</span>
                </div>
              </div>

              {/* Khung chat nhóm nhỏ minh họa */}
              <div className="chat-preview-box">
                <div className="chat-preview-header">💬 Chat Workspace</div>
                <div className="chat-msg">
                  <strong>A:</strong> Mình vừa bổ sung mục 1 rồi nhé!
                </div>
                <div className="chat-msg">
                  <strong>B:</strong> Ok, để mình cập nhật phần 2.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tính năng cốt lõi */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Tính năng nổi bật</h2>
          <p>Mọi công cụ cần thiết để nhóm bạn cộng tác tài liệu hiệu quả nhất</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Chỉnh sửa cùng nhau</h3>
            <p>
              Nhiều thành viên cùng thao tác trên một tài liệu đồng thời. Con trỏ soạn thảo của từng người được hiển thị trực quan theo thời gian thực.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Cập nhật trực tiếp</h3>
            <p>
              Tận dụng sức mạnh của Yjs và WebSockets. Mọi thay đổi về câu chữ đều được tự động hợp nhất và lưu bền vững, không bao giờ mất dữ liệu.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Trao đổi trong Workspace</h3>
            <p>
              Tích hợp sẵn khung chat và thông báo trạng thái online ngay bên cạnh tài liệu. Thảo luận nhanh chóng mà không cần chuyển đổi ứng dụng.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Cách hoạt động */}
      <section id="how-it-works" className="steps-section">
        <div className="section-header">
          <h2>Cách hoạt động</h2>
          <p>Chỉ 3 bước đơn giản để bắt đầu làm việc cùng nhóm</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Tạo Workspace</h4>
            <p>Khởi tạo không gian làm việc riêng cho nhóm hoặc môn học của bạn chỉ trong vài giây.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Mời thành viên</h4>
            <p>Thêm các bạn cùng nhóm vào Workspace để chia sẻ quyền chỉnh sửa và cùng thảo luận.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Cùng tạo & Chỉnh sửa</h4>
            <p>Tạo tài liệu mới và bắt đầu gõ cùng nhau trong thời gian thực mượt mà.</p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">📝</span>
            <span className="logo-text">SyncDoc</span>
          </div>
          <p>© 2026 SyncDoc - Đồ án Hệ thống cộng tác chỉnh sửa tài liệu trực tuyến theo thời gian thực.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
