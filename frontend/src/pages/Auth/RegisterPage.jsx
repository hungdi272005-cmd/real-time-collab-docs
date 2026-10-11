import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Kiểm tra xác nhận mật khẩu ở Frontend
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);

    try {
      const { name, email, password } = formData;
      const response = await authApi.register({ name, email, password });
      
      setSuccess(response.data.message || 'Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại!';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* 1. Cột nhận diện thương hiệu bên trái (Desktop) */}
      <div className="auth-brand-panel">
        <div>
          <Link to="/" className="brand-header-link">
            <span className="logo-icon">📝</span>
            <span className="logo-text">SyncDoc</span>
          </Link>

          <div className="brand-hero-text" style={{ marginTop: '48px' }}>
            <h1>Bắt đầu không gian làm việc của bạn.</h1>
            <p>
              Tạo tài khoản miễn phí để thiết lập Workspace, mời các thành viên và cộng tác soạn thảo tài liệu.
            </p>

            <div className="brand-features-list">
              <div className="brand-feature-item">
                <span className="check-icon">✓</span>
                <span>Khởi tạo Workspace nhóm trong 30 giây</span>
              </div>
              <div className="brand-feature-item">
                <span className="check-icon">✓</span>
                <span>Phân quyền rõ ràng giữa chủ nhóm và thành viên</span>
              </div>
              <div className="brand-feature-item">
                <span className="check-icon">✓</span>
                <span>Lưu trữ phiên bản và lịch sử thao tác bền vững</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer-quote">
          © 2026 SyncDoc. Nền tảng cộng tác trực tuyến thông minh.
        </div>
      </div>

      {/* 2. Cột Form đăng ký bên phải (Mobile + Desktop) */}
      <div className="auth-form-panel">
        {/* Logo xuất hiện trên Mobile khi cột trái bị ẩn */}
        <Link to="/" className="mobile-brand-header">
          <span className="logo-icon">📝</span>
          <span className="logo-text">SyncDoc</span>
        </Link>

        <div className="auth-form-box">
          <h2 className="form-title">Tạo Tài Khoản</h2>
          <p className="form-subtitle">Điền thông tin bên dưới để bắt đầu sử dụng SyncDoc</p>

          {error && <div className="auth-alert error">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>
            </div>

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
                  placeholder="Tạo mật khẩu an toàn"
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
              <div className="password-rules-box">
                ℹ️ Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&).
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </button>
          </form>

          <div className="auth-switch-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
