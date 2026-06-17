const SOCIAL_FIELDS = [
    { key: 'facebookUrl', label: 'Facebook URL', icon: 'public' },
    { key: 'instagramUrl', label: 'instagram.com/...', icon: 'photo_camera' },
    { key: 'linkedinUrl', label: 'linkedin.com/in/...', icon: 'work' },
    { key: 'githubUrl', label: 'GitHub URL', icon: 'code' },
];

/**
 * SocialLinksTab — liên kết mạng xã hội (Facebook, Instagram, LinkedIn, GitHub).
 */
export default function SocialLinksTab({ form, updateField }) {
    return (
        <div className="epm-section">
            <h4 className="epm-subheading">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>link</span>
                Liên kết mạng xã hội
            </h4>

            <div className="epm-row epm-row-2">
                {SOCIAL_FIELDS.map((f) => (
                    <div className="epm-field" key={f.key}>
                        <div className="epm-icon-input-wrap">
                            <span className="material-symbols-outlined epm-icon-prefix">{f.icon}</span>
                            <input
                                className="epm-input epm-input-with-icon"
                                value={form[f.key] || ''}
                                onChange={(e) => updateField(f.key, e.target.value)}
                                placeholder={f.label}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}