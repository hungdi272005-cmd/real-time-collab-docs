import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* 1. Cột nhận diện thương hiệu bên trái (Hiển thị trên Desktop) */}
      <div className="auth-brand-panel">
        <div>
          <Link to="/" className="brand-header-link">
            <span className="logo-icon">📝</span>
            <span className="logo-text">SyncDoc</span>
          </Link>

          <div className="brand-hero-text" style={{ marginTop: '48px' }}>
            <h1>Cùng làm việc trên một tài liệu chung.</h1>
            <p>
              Đồng bộ hóa thay đổi tức thì, kết nối các thành viên và hoàn thành công việc nhanh hơn bao giờ hết.
            </p>

            <div className="brand-features-list">
              <div className="brand-feature-item">
                <span className="check-icon">✓</span>
                <span>Chỉnh sửa văn bản thời gian thực (Real-time)</span>
              </div>
              <div className="brand-feature-item">
                <span className="check-icon">✓</span>
                <span>Tự động hợp nhất thay đổi, không lo mất nội dung</span>
              </div>
              <div className="brand-feature-item">
                <span className="check-icon">✓</span>
                <span>Chat và xem hoạt động trực tiếp trong nhóm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer-quote">
          © 2026 SyncDoc. Nền tảng cộng tác trực tuyến thông minh.
        </div>
      </div>

      {/* 2. Cột Form đăng nhập bên phải (Responsive tự căn chỉnh trên Mobile) */}
      <div className="auth-form-panel">
        {/* Logo xuất hiện trên Mobile khi cột trái bị ẩn */}
        <Link to="/" className="mobile-brand-header">
          <span className="logo-icon">📝</span>
          <span className="logo-text">SyncDoc</span>
        </Link>

        <div className="auth-form-box">
          <h2 className="form-title">Đăng Nhập</h2>
          <p className="form-subtitle">Chào mừng trở lại! Đăng nhập để tiếp tục làm việc.</p>

          {error && <div className="auth-alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="auth-switch-text">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
