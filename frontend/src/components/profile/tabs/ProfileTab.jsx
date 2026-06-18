import { useEffect, useRef, useState } from 'react';

/**
 * ProfileTab — avatar, thông tin cơ bản (tên, giới tính, ngày sinh, email), bio.
 */
export default function ProfileTab({ form, updateField, currentUser, avatarFile, setAvatarFile }) {
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    /* Quản lý blob URL — tự revoke khi file đổi hoặc unmount */
    useEffect(() => {
        if (!avatarFile) { setAvatarPreview(null); return; }
        const url = URL.createObjectURL(avatarFile);
        setAvatarPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    const displaySrc = avatarPreview ?? currentUser?.avatarUrl ?? '/default-avatar.png';

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) setAvatarFile(file);
    };

    return (
        <div className="epm-section">
            {/* Banner + Avatar — click avatar để đổi */}
            <div className="epm-banner-wrap">
                <div className="epm-banner" />
                <button
                    type="button"
                    className="epm-avatar-btn-wrap"
                    onClick={() => fileInputRef.current?.click()}
                    title="Đổi ảnh đại diện"
                >
                    <img src={displaySrc} alt="Avatar" className="epm-avatar" />
                    <span className="epm-avatar-overlay">
                        <span className="material-symbols-outlined">photo_camera</span>
                    </span>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="epm-hidden-input"
                    onChange={handleAvatarChange}
                />
            </div>

            <div className="epm-row epm-row-2">
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-displayName">Họ và tên</label>
                    <input
                        id="epm-displayName"
                        className="epm-input"
                        type="text"
                        value={form.displayName || ''}
                        onChange={(e) => updateField('displayName', e.target.value)}
                        maxLength={100}
                        placeholder="Nhập họ và tên"
                    />
                </div>
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-gender">Giới tính</label>
                    <select
                        id="epm-gender"
                        className="epm-input"
                        value={form.gender || ''}
                        onChange={(e) => updateField('gender', e.target.value)}
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                    </select>
                </div>
            </div>

            <div className="epm-row epm-row-2">
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-birthdate">Ngày sinh</label>
                    <input
                        id="epm-birthdate"
                        type="date"
                        className="epm-input"
                        value={form.birthdate || ''}
                        onChange={(e) => updateField('birthdate', e.target.value)}
                    />
                </div>
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-email">Email</label>
                    <input
                        id="epm-email"
                        className="epm-input"
                        value={currentUser?.email || ''}
                        disabled
                    />
                </div>
            </div>

            <div className="epm-field">
                <label className="epm-label">Mật khẩu</label>
                <div className="epm-password-row">
                    <span className="epm-password-dots">••••••••</span>
                    <button type="button" className="epm-link-btn">Thay đổi</button>
                </div>
            </div>

            <div className="epm-field">
                <label className="epm-label" htmlFor="epm-bio">Tiểu sử</label>
                <textarea
                    id="epm-bio"
                    className="epm-input epm-textarea"
                    value={form.bio || ''}
                    onChange={(e) => updateField('bio', e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Viết gì đó về bạn..."
                />
                <span className="epm-char-count">{(form.bio || '').length}/500</span>
            </div>
        </div>
    );
}