import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import AuthVisual from '../components/auth/AuthVisual';
import InputField from '../components/auth/InputField';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!form.terms) {
      alert('Bạn cần đồng ý với Điều khoản & Chính sách bảo mật.');
      return;
    }
    console.log('Register:', form);
    // TODO: gọi API đăng ký
  };

  return (
    <PageTransition>
      <main className="auth-layout" style={{ flexDirection: 'row' }}>

        {/* ── Form Side (40%) — bên trái ────────────────────────── */}
        <section className="auth-form-side register-form-side">
          <div className="auth-form-wrapper">

            {/* Mobile brand */}
            <div className="mobile-brand">
              <h1>TramSpace</h1>
            </div>

            {/* Header */}
            <header className="auth-header" style={{ textAlign: 'left', marginBottom: 28 }}>
              <h2>Tạo tài khoản của bạn</h2>
              <p>
                Tham gia cùng hàng ngàn người đang chia sẻ khoảnh khắc
                và xây dựng cộng đồng.
              </p>
            </header>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {/* Full Name */}
              <div className="input-group">
                <label htmlFor="fullName">Họ và tên</label>
                <div className="input-wrapper">
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="input-field register-input"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="input-group">
                <label htmlFor="dob">Ngày sinh</label>
                <div className="input-wrapper">
                  <input
                    id="dob"
                    type="date"
                    className="input-field register-input"
                    value={form.dob}
                    onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="input-group">
                <label htmlFor="gender">Giới tính</label>
                <div className="input-wrapper">
                  <select
                    id="gender"
                    className="input-field register-input"
                    value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: 'absolute', right: 16, top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none', color: '#6c7a77',
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Email */}
              <InputField
                id="email"
                label="Địa chỉ Email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                variant="register"
              />

              {/* Password */}
              <InputField
                id="password"
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                variant="register"
              />

              {/* Confirm Password */}
              <InputField
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                variant="register"
              />

              {/* Terms */}
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm((p) => ({ ...p, terms: e.target.checked }))}
                />
                <span>
                  Tôi đồng ý với{' '}
                  <a href="#">Điều khoản</a>
                  {' & '}
                  <a href="#">Chính sách bảo mật</a>.
                </span>
              </label>

              {/* Submit */}
              <button type="submit" className="btn-primary" style={{ marginTop: 24 }}>
                Tạo tài khoản
              </button>

              {/* Social */}
              <SocialAuthButtons label="tiếp tục với" />

              {/* Footer */}
              <div className="auth-footer" style={{ marginTop: 16 }}>
                Đã có tài khoản?{' '}
                <Link to="/login">Đăng nhập</Link>
              </div>
            </form>
          </div>
        </section>

        {/* ── Visual Side (60%) — bên phải ──────────────────────── */}
        <AuthVisual cards="register" />

      </main>
    </PageTransition>
  );
}
