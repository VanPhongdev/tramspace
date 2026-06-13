import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import AuthVisual from '../components/auth/AuthVisual';
import InputField from '../components/auth/InputField';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const navigate = useNavigate()
  const validateEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {}

    if (!form.email || !validateEmail(form.email.trim())) {
      nextErrors.email = 'Vui lòng nhập email hợp lệ'
    }
    if (!form.password || form.password.trim().length === 0) {
      nextErrors.password = 'Vui lòng nhập mật khẩu'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setErrorMessage(null)
    setIsSubmitting(true)
    import('../lib/api').then(({ default: api }) => {
      api.login({ email: form.email, password: form.password })
        .then(() => {
          setIsSubmitting(false)
          navigate('/')
        })
        .catch((err) => {
          const fieldErrors = err?.response?.data?.errors || {}
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(Object.fromEntries(
              Object.entries(fieldErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
            ))
            setErrorMessage(null)
          } else {
            const msg = err?.response?.data?.message || err?.response?.data?.error || 'Lỗi khi đăng nhập'
            setErrorMessage(msg)
          }
          setIsSubmitting(false)
        })
    })
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
              <div className="input-group">
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
                {errors.email && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.email}</div>
                )}
              </div>

              <div className="input-group">
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
                {errors.password && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.password}</div>
                )}
              </div>

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

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              {errorMessage && (
                <div style={{ color: '#b91c1c', marginTop: 8 }}>{errorMessage}</div>
              )}
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
