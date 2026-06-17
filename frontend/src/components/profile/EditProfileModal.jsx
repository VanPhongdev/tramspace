import { useEffect, useState } from 'react';
import { useEditProfileForm } from './UseEditProfileForm';
import ProfileTab from './tabs/ProfileTab';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import PreferencesTab from './tabs/PreferencesTab';

const TABS = [
  { key: 'profile', icon: 'person', label: 'Hồ sơ' },
  { key: 'personal', icon: 'badge', label: 'Thông tin cá nhân' },
  { key: 'social', icon: 'link', label: 'Liên kết mạng xã hội' },
  { key: 'prefs', icon: 'tune', label: 'Quyền riêng tư & Tùy chọn' },
];

/**
 * EditProfileModal — chỉnh sửa hồ sơ đầy đủ (4 tab).
 * Props: currentUser, isOpen, onClose, onUpdated(updatedUser)
 */
export default function EditProfileModal({ currentUser, isOpen, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('profile');

  const {
    form,
    updateField,
    avatarFile,
    setAvatarFile,
    saving,
    error,
    usernameError,
    cooldownInfo,
    isUsernameOnCooldown,
    isDirty,
    handleSave,
  } = useEditProfileForm(currentUser, isOpen, onUpdated, onClose);

  /* Reset về tab đầu mỗi khi mở modal */
  useEffect(() => {
    if (isOpen) setActiveTab('profile');
  }, [isOpen]);

  /* Đóng bằng Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cp-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="cp-modal epm-modal epm-modal-wide" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="cp-header">
          <h2 className="cp-title">TramSpace&nbsp;&nbsp;|&nbsp;&nbsp;Chỉnh sửa hồ sơ</h2>
          <button className="cp-close" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="cp-hr" />

        <div className="epm-layout">
          {/* Sidebar */}
          <aside className="epm-sidebar">
            <p className="epm-sidebar-title">Cài đặt tài khoản</p>
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`epm-sidebar-item ${activeTab === t.key ? 'epm-sidebar-item-active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                <span className="material-symbols-outlined">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="cp-body epm-body epm-scrollable">
            {activeTab === 'profile' && (
              <ProfileTab
                form={form}
                updateField={updateField}
                currentUser={currentUser}
                avatarFile={avatarFile}
                setAvatarFile={setAvatarFile}
              />
            )}
            {activeTab === 'personal' && (
              <PersonalInfoTab
                form={form}
                updateField={updateField}
                cooldownInfo={cooldownInfo}
                isUsernameOnCooldown={isUsernameOnCooldown}
                usernameError={usernameError}
              />
            )}
            {activeTab === 'social' && (
              <SocialLinksTab form={form} updateField={updateField} />
            )}
            {activeTab === 'prefs' && (
              <PreferencesTab form={form} updateField={updateField} />
            )}

            {error && <p className="epm-field-error" style={{ marginTop: 12 }}>{error}</p>}
          </div>
        </div>

        <div className="cp-hr" />

        {/* Footer */}
        <div className="cp-footer epm-footer-wide">
          {isDirty
            ? (
              <span className="epm-unsaved-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                Thay đổi chưa được lưu
              </span>
            )
            : <span />}
          <div className="epm-footer-actions">
            <button type="button" className="epm-cancel-btn" onClick={onClose} disabled={saving}>
              Hủy bỏ
            </button>
            <button
              type="button"
              className="cp-submit"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}