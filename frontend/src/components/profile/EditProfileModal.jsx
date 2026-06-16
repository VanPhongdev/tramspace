import { useEffect, useRef, useState } from 'react';
import api from '../../lib/api';

/**
 * EditProfileModal — chỉnh sửa thông tin cá nhân.
 * Props: currentUser, isOpen, onClose, onUpdated(updatedUser)
 */
export default function EditProfileModal({ currentUser, isOpen, onClose, onUpdated }) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [usernameError, setUsernameError] = useState(null);

  /* Sync form khi mở modal */
  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.displayName || '');
      setBio(currentUser.bio || '');
      setUsername(currentUser.username || '');
      setError(null);
      setUsernameError(null);
    }
  }, [isOpen, currentUser]);

  /* Đóng bằng Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ── Helper: cooldown info ── */
  const cooldownInfo = (() => {
    if (!currentUser?.usernameUpdatedAt) return null;
    const updated = new Date(currentUser.usernameUpdatedAt);
    const nextAllowed = new Date(updated);
    nextAllowed.setDate(nextAllowed.getDate() + 7);
    const now = new Date();
    if (now < nextAllowed) {
      return `Có thể đổi username lại vào ${nextAllowed.toLocaleDateString('vi-VN')}`;
    }
    return null;
  })();

  const isUsernameChanged = username.trim() !== (currentUser?.username || '');
  const isUsernameOnCooldown = !!cooldownInfo && isUsernameChanged;

  /* ── Submit ── */
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    setUsernameError(null);

    try {
      let updatedUser = currentUser;

      // 1. Cập nhật profile thông thường (displayName, bio)
      const profileChanged = displayName.trim() !== (currentUser?.displayName || '') || bio.trim() !== (currentUser?.bio || '');
      if (profileChanged) {
        const payload = {};
        if (displayName.trim()) payload.displayName = displayName.trim();
        payload.bio = bio.trim();
        updatedUser = await api.updateProfile(payload);
      }

      // 2. Cập nhật username riêng (nếu thay đổi)
      if (isUsernameChanged && username.trim()) {
        try {
          const result = await api.updateUsername(username.trim());
          updatedUser = result.data ?? updatedUser;
        } catch (err) {
          const msg = err?.response?.data?.message || 'Không thể đổi username';
          setUsernameError(msg);
          setSaving(false);
          return; // dừng lại, không đóng modal
        }
      }

      onUpdated?.(updatedUser);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Không thể lưu thông tin';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="cp-modal epm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="cp-header">
          <h2 className="cp-title">Chỉnh sửa trang cá nhân</h2>
          <button className="cp-close" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="cp-hr" />

        {/* Body */}
        <div className="cp-body epm-body">

          {/* Tên hiển thị */}
          <div className="epm-field">
            <label className="epm-label" htmlFor="epm-displayName">Tên hiển thị</label>
            <input
              id="epm-displayName"
              className="epm-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              placeholder="Nhập tên hiển thị"
            />
          </div>

          {/* Bio */}
          <div className="epm-field">
            <label className="epm-label" htmlFor="epm-bio">Tiểu sử</label>
            <textarea
              id="epm-bio"
              className="epm-input epm-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Viết gì đó về bạn..."
            />
            <span className="epm-char-count">{bio.length}/500</span>
          </div>

          {/* Username */}
          <div className="epm-field">
            <label className="epm-label" htmlFor="epm-username">
              Username
              {cooldownInfo && (
                <span className="epm-cooldown-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                  {cooldownInfo}
                </span>
              )}
            </label>
            <div className="epm-username-wrap">
              <span className="epm-username-prefix"></span>
              <input
                id="epm-username"
                className={`epm-input epm-username-input ${usernameError ? 'epm-input-error' : ''}`}
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setUsernameError(null); }}
                maxLength={30}
                placeholder="username"
                disabled={isUsernameOnCooldown}
              />
            </div>
            {usernameError && (
              <p className="epm-field-error">{usernameError}</p>
            )}
            <p className="epm-hint">Chỉ chứa chữ, số, dấu chấm (.) và gạch dưới (_). Tối đa 30 ký tự.</p>
          </div>

          {/* Lỗi tổng */}
          {error && <p className="epm-field-error">{error}</p>}
        </div>

        <div className="cp-hr" />

        {/* Footer */}
        <div className="cp-footer">
          <button className="epm-cancel-btn" onClick={onClose} disabled={saving}>
            Hủy
          </button>
          <button
            className="cp-submit"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
