import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import AuthVisual from '../components/auth/AuthVisual';
import InputField from '../components/auth/InputField';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import { useToast } from '../context/ToastContext';

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

  const navigate = useNavigate()
  const toast = useToast()
  const validateEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
  const today = new Date().toISOString().split('T')[0]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {}

    if (!form.fullName || form.fullName.trim().length < 4) {
      nextErrors.fullName = 'Họ và tên phải có ít nhất 4 ký tự'
    }
    if (!form.dob) {
      nextErrors.dob = 'Vui lòng chọn ngày sinh'
    } else {
      const selectedDob = new Date(form.dob)
      const maxDob = new Date()
      selectedDob.setHours(0, 0, 0, 0)
      maxDob.setHours(0, 0, 0, 0)
      if (selectedDob > maxDob) {
        nextErrors.dob = 'Ngày sinh không được lớn hơn ngày hiện tại'
      }
    }
    if (!form.gender) {
      nextErrors.gender = 'Vui lòng chọn giới tính'
    }
    if (!form.email || !validateEmail(form.email)) {
      nextErrors.email = 'Vui lòng nhập email hợp lệ'
    }
    if (!form.password || form.password.length < 6) {
      nextErrors.password = 'Mật khẩu cần ít nhất 6 ký tự'
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    if (!form.terms) {
      nextErrors.terms = 'Bạn cần đồng ý với Điều khoản & Chính sách bảo mật.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setErrorMessage(null)
    setIsSubmitting(true)
    console.log('Register:', form);
    const payload = {
      displayName: form.fullName,
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      gender: form.gender,
      dateOfBirth: form.dob,
    }
    import('../lib/api').then(({ default: api }) => {
      api.register(payload)
        .then(() => {
          setIsSubmitting(false)
          toast.success('Đăng ký thành công — hãy đăng nhập')
          navigate('/login')
        })
        .catch((err) => {
          const fieldErrors = err?.response?.data?.errors || {}
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(Object.fromEntries(
              Object.entries(fieldErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
            ))
            setErrorMessage(null)
          } else {
            const msg = err?.response?.data?.message || err?.response?.data?.error || 'Lỗi khi đăng ký'
            setErrorMessage(msg)
          }
          setIsSubmitting(false)
        })
    })
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
                {errors.fullName && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.fullName}</div>
                )}
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
                    max={today}
                    onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                    required
                  />
                </div>
                {errors.dob && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.dob}</div>
                )}
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
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
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
                {errors.gender && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.gender}</div>
                )}
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
              {errors.email && (
                <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.email}</div>
              )}

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
              {errors.password && (
                <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.password}</div>
              )}

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
              {errors.confirmPassword && (
                <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.confirmPassword}</div>
              )}

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
              {errors.terms && (
                <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.terms}</div>
              )}

              {/* Submit */}
              <button type="submit" className="btn-primary" style={{ marginTop: 24 }} disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Tạo tài khoản'}
              </button>

              {errorMessage && (
                <div style={{ color: '#b91c1c', marginTop: 8 }}>{errorMessage}</div>
              )}

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
