/**
 * Toggle — switch bật/tắt dùng chung cho privacy & preferences.
 */
function Toggle({ checked, onChange, label, hint }) {
    return (
        <div className="epm-toggle-row">
            <div className="epm-toggle-text">
                <p className="epm-toggle-label">{label}</p>
                <p className="epm-toggle-hint">{hint}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`epm-toggle ${checked ? 'epm-toggle-on' : ''}`}
            >
                <span className="epm-toggle-knob" />
            </button>
        </div>
    );
}

/**
 * PreferencesTab — Quyền riêng tư (công khai hồ sơ, tin nhắn từ người lạ)
 * và Tùy chọn (chế độ tối, thông báo đẩy).
 */
export default function PreferencesTab({ form, updateField }) {
    return (
        <div className="epm-row epm-row-2 epm-row-align-top">
            <div className="epm-section">
                <h4 className="epm-subheading">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
                    Quyền riêng tư
                </h4>
                <Toggle
                    checked={form.isPublic}
                    onChange={(v) => updateField('isPublic', v)}
                    label="Công khai hồ sơ"
                    hint="Cho phép mọi người tìm thấy bạn"
                />
                <Toggle
                    checked={form.allowMessagesFromStrangers}
                    onChange={(v) => updateField('allowMessagesFromStrangers', v)}
                    label="Tin nhắn từ người lạ"
                    hint="Chấp nhận tin nhắn từ mọi người"
                />
            </div>

            <div className="epm-section">
                <h4 className="epm-subheading">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
                    Tùy chọn
                </h4>
                <Toggle
                    checked={form.darkMode}
                    onChange={(v) => updateField('darkMode', v)}
                    label="Chế độ tối"
                    hint="Giao diện màu tối cao cấp"
                />
                <Toggle
                    checked={form.pushNotifications}
                    onChange={(v) => updateField('pushNotifications', v)}
                    label="Thông báo đẩy"
                    hint="Nhận tin tức mới nhất"
                />
            </div>
        </div>
    );
}