import { useMemo } from 'react';
import { VIETNAM_PROVINCES } from './suggestions';

/**
 * useVietnamProvinces — trả về danh sách tỉnh/thành để dùng cho autocomplete.
 * Bọc trong useMemo để tránh tạo lại mảng mỗi render.
 */
export function useVietnamProvinces() {
    const provinces = useMemo(() => VIETNAM_PROVINCES, []);
    return { provinces };
}
