import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import AuthVisual from '../components/auth/AuthVisual';
import InputField from '../components/auth/InputField';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', form);
    // TODO: gọi API đăng nhập
  };

  return (
    <PageTransition>
      <main className="auth-layout">

        {/* ── Visual Side (60%) ─────────────────────────────────── */}
        <AuthVisual cards="login" />

        {/* ── Form Side (40%) ───────────────────────────────────── */}
        <section className="auth-form-side">
          <div className="auth-form-wrapper">

            {/* Header */}
            <div className="auth-header">
              <h2>Chào mừng trở lại</h2>
              <p>Đăng nhập để tiếp tục hành trình của bạn trên TramSpace.</p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <InputField
                id="email"
                label="Địa chỉ Email"
                type="email"
                placeholder="email@tramspace.com"
                icon="mail"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                variant="login"
              />
              <InputField
                id="password"
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                icon="lock"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                variant="login"
              />

              {/* Remember me & Forgot */}
              <div className="login-options">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a className="forgot-link" href="#">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="btn-primary">
                Đăng nhập
              </button>
            </form>

            {/* Social */}
            <SocialAuthButtons label="đăng nhập với" />

            {/* Footer */}
            <div className="auth-footer">
              Chưa có tài khoản?{' '}
              <Link to="/register">Tạo tài khoản mới</Link>
            </div>

          </div>
        </section>
      </main>
    </PageTransition>
  );
}
