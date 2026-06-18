/**
 * UserAvatar — hiển thị avatar dạng tròn.
 * Nếu có avatarUrl → dùng <img>.
 * Nếu không → hiển thị initials + màu nền.
 *
 * Props:
 *   avatarUrl?: string | null
 *   initials: string
 *   color: string          — màu nền fallback (hex)
 *   size?: number          — px, mặc định 40
 *   className?: string
 *   style?: object
 */
export default function UserAvatar({ avatarUrl, initials, color, size = 40, className = '', style = {} }) {
    const base = {
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: avatarUrl ? 'transparent' : color,
        fontSize: size * 0.35,
        fontWeight: 700,
        color: '#fff',
        ...style,
    };

    return (
        <div className={className} style={base}>
            {avatarUrl
                ? <img src={avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{initials}</span>
            }
        </div>
    );
}
