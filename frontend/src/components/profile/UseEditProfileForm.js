import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';

const USERNAME_REGEX = /^[a-zA-Z0-9._]+$/;

const buildInitialForm = (user) => ({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    username: user?.username || '',
    gender: user?.gender || '',
    birthdate: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    hometown: user?.hometown || '',
    currentLocation: user?.currentLocation || '',
    occupation: user?.occupation || '',
    major: user?.major || '',
    facebookUrl: user?.facebookUrl || '',
    instagramUrl: user?.instagramUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    isPublic: user?.isPublic ?? true,
    allowMessagesFromStrangers: user?.allowMessagesFromStrangers ?? false,
    darkMode: user?.darkMode ?? false,
    pushNotifications: user?.pushNotifications ?? true,
});

/**
 * useEditProfileForm — quản lý state, validate và logic save
 * cho toàn bộ form chỉnh sửa hồ sơ (4 tab).
 */
export function useEditProfileForm(currentUser, isOpen, onUpdated, onClose) {
    const [form, setForm] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [usernameError, setUsernameError] = useState(null);

    /* Sync form mỗi khi mở modal */
    useEffect(() => {
        if (isOpen && currentUser) {
            setForm(buildInitialForm(currentUser));
            setAvatarFile(null);
            setError(null);
            setUsernameError(null);
        }
    }, [isOpen, currentUser]);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (field === 'username') setUsernameError(null);
    };

    /* Cooldown đổi username — giữ nguyên logic gốc */
    const cooldownInfo = useMemo(() => {
        if (!currentUser?.usernameUpdatedAt) return null;
        const updated = new Date(currentUser.usernameUpdatedAt);
        const nextAllowed = new Date(updated);
        nextAllowed.setDate(nextAllowed.getDate() + 7);
        const now = new Date();
        if (now < nextAllowed) {
            return `Có thể đổi username lại vào ${nextAllowed.toLocaleDateString('vi-VN')}`;
        }
        return null;
    }, [currentUser?.usernameUpdatedAt]);

    const isUsernameChanged = (form.username || '').trim() !== (currentUser?.username || '');
    const isUsernameOnCooldown = !!cooldownInfo && isUsernameChanged;

    /* isDirty: so sánh form hiện tại với data gốc + có avatar mới không */
    const isDirty = useMemo(() => {
        if (avatarFile) return true;
        if (!currentUser) return false;
        const original = buildInitialForm(currentUser);
        return JSON.stringify(form) !== JSON.stringify(original);
    }, [form, avatarFile, currentUser]);

    const handleSave = async () => {
        if (saving) return;

        // Validate format username trước khi gọi API
        if (isUsernameChanged && form.username?.trim() && !USERNAME_REGEX.test(form.username.trim())) {
            setUsernameError('Username chỉ chứa chữ, số, dấu chấm (.) và gạch dưới (_)');
            return;
        }

        setSaving(true);
        setError(null);
        setUsernameError(null);

        try {
            let updatedUser = currentUser;

            // 1. Username trước — dễ fail nhất (cooldown / trùng tên)
            // Tránh tình trạng lưu nửa chừng: profile thành công nhưng username fail
            if (isUsernameChanged && form.username?.trim()) {
                try {
                    const result = await api.updateUsername(form.username.trim());
                    updatedUser = result.data ?? updatedUser;
                } catch (err) {
                    const msg = err?.response?.data?.message || 'Không thể đổi username';
                    setUsernameError(msg);
                    setSaving(false);
                    return; // dừng lại, không đóng modal
                }
            }

            // 2. Avatar — upload riêng nếu có file mới
            if (avatarFile) {
                const fd = new FormData();
                fd.append('avatar', avatarFile);
                const avatarResult = await api.uploadAvatar(fd);
                updatedUser = { ...updatedUser, avatar: avatarResult.data.avatar };
            }

            // 3. Phần còn lại của profile (bỏ username vì đã xử lý riêng ở bước 1)
            const { username, ...profilePayload } = form;
            updatedUser = await api.updateProfile(profilePayload);

            onUpdated?.(updatedUser);
            onClose?.();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || 'Không thể lưu thông tin';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return {
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
    };
}