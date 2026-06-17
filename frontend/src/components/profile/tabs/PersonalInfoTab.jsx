import AutocompleteInput from '../AutocompleteInput';
import { useVietnamProvinces } from '../useVietnamProvinces';
import { OCCUPATION_SUGGESTIONS, MAJOR_SUGGESTIONS } from '../suggestions';

/**
 * PersonalInfoTab — username (giữ nguyên logic cooldown gốc),
 * quê quán / nơi ở hiện tại / nghề nghiệp / học vấn dùng autocomplete.
 */
export default function PersonalInfoTab({ form, updateField, cooldownInfo, isUsernameOnCooldown, usernameError }) {
    const { provinces } = useVietnamProvinces();

    return (
        <div className="epm-section">
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
                <input
                    id="epm-username"
                    className={`epm-input ${usernameError ? 'epm-input-error' : ''}`}
                    type="text"
                    value={form.username || ''}
                    onChange={(e) => updateField('username', e.target.value)}
                    maxLength={30}
                    placeholder="username"
                    disabled={isUsernameOnCooldown}
                />
                {usernameError && <p className="epm-field-error">{usernameError}</p>}
                <p className="epm-hint">Chỉ chứa chữ, số, dấu chấm (.) và gạch dưới (_). Tối đa 30 ký tự.</p>
            </div>

            <h4 className="epm-subheading">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>badge</span>
                Thông tin cá nhân
            </h4>

            {/* Quê quán + Nơi ở hiện tại — cùng dùng data tỉnh/thành */}
            <div className="epm-row epm-row-2">
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-hometown">Quê quán</label>
                    <AutocompleteInput
                        value={form.hometown || ''}
                        onChange={(v) => updateField('hometown', v)}
                        options={provinces}
                        placeholder="Nghệ An"
                    />
                </div>
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-currentLocation">Nơi ở hiện tại</label>
                    <AutocompleteInput
                        value={form.currentLocation || ''}
                        onChange={(v) => updateField('currentLocation', v)}
                        options={provinces}
                        placeholder="TP. Hồ Chí Minh"
                    />
                </div>
            </div>

            <div className="epm-row epm-row-2">
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-occupation">Nghề nghiệp</label>
                    <AutocompleteInput
                        value={form.occupation || ''}
                        onChange={(v) => updateField('occupation', v)}
                        options={OCCUPATION_SUGGESTIONS}
                        placeholder="UI/UX Designer"
                    />
                </div>
                <div className="epm-field">
                    <label className="epm-label" htmlFor="epm-major">Học vấn</label>
                    <AutocompleteInput
                        value={form.major || ''}
                        onChange={(v) => updateField('major', v)}
                        options={MAJOR_SUGGESTIONS}
                        placeholder="Công nghệ thông tin"
                    />
                </div>
            </div>
        </div>
    );
}