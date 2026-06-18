import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';
import UserAvatar from '../UserAvatar.jsx';

/* ─── Navigation items ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/',          icon: 'home',          iconFill: 'home',          label: 'Trang chủ'  },
  { to: '/explore',   icon: 'explore',       iconFill: 'explore',       label: 'Khám phá'   },
  { to: '/community', icon: 'groups',        iconFill: 'groups',        label: 'Cộng đồng'  },
  { to: '/reels',     icon: 'movie',         iconFill: 'movie',         label: 'Thước phim' },
  { to: '/events',    icon: 'event',         iconFill: 'event',         label: 'Sự kiện'    },
];

const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ─── Navbar Component ─────────────────────────────────────────── */
export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue,  setSearchValue]  = useState('');
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  /* Fetch current user on mount */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleProfileClick = (event) => {
    event?.stopPropagation();
    if (user?.id) {
      navigate(`/profile/${user.username ?? user.id}`);
      setDropdownOpen(false);
    }
  };

  return (
    <header className="navbar">
      {/* ── LEFT: Logo + Search ───────────────────────────────── */}
      <div className="navbar-left">
        <NavLink to="/" className="navbar-logo">
          TramSpace
        </NavLink>

        <div className="navbar-search-wrap">
          <span className="material-symbols-outlined navbar-search-icon">search</span>
          <input
            className="navbar-search-input"
            type="text"
            placeholder="Tìm kiếm xu hướng, mọi người hoặc nhóm..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Tìm kiếm"
          />
        </div>
      </div>

      {/* ── CENTER: Nav links ─────────────────────────────────── */}
      <nav className="navbar-center" aria-label="Điều hướng chính">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              ['navbar-nav-item', isActive ? 'active' : ''].filter(Boolean).join(' ')
            }
            title={label}
          >
            <span className="material-symbols-outlined navbar-nav-icon">{icon}</span>
            <span className="navbar-nav-label">{label}</span>
            <span className="navbar-nav-indicator" />
          </NavLink>
        ))}
      </nav>

      {/* ── RIGHT: Actions + Avatar ───────────────────────────── */}
      <div className="navbar-right">
        {/* Messages */}
        <button className="navbar-action-btn" title="Tin nhắn" aria-label="Tin nhắn">
          <span className="material-symbols-outlined">chat</span>
          <span className="navbar-badge" aria-label="3 tin nhắn chưa đọc">3</span>
        </button>

        {/* Notifications */}
        <button className="navbar-action-btn" title="Thông báo" aria-label="Thông báo">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Avatar + Dropdown */}
        <div className="navbar-avatar-wrap" ref={dropdownRef}>
          <button
            className={`navbar-avatar-btn ${dropdownOpen ? 'open' : ''}`}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="Menu tài khoản"
          >
          <div className="navbar-avatar-img">
              <UserAvatar
                avatarUrl={user?.avatarUrl}
                initials={getInitials(user?.displayName || user?.email)}
                color="#006b5f"
                size={36}
              />
            </div>
            <span className="material-symbols-outlined navbar-avatar-chevron">
              expand_more
            </span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="navbar-dropdown" role="menu">
              {/* User info */}
              <div className="navbar-dropdown-user">
                <UserAvatar
                  avatarUrl={user?.avatarUrl}
                  initials={getInitials(user?.displayName || user?.email)}
                  color="#006b5f"
                  size={44}
                  className="navbar-dropdown-avatar"
                />
                <div>
                  <p className="navbar-dropdown-name">{user?.displayName || user?.email || 'Người dùng'}</p>
                  <p className="navbar-dropdown-email">
                    {user?.username ? `@${user.username}` : user?.email || 'Email'}
                  </p>
                </div>
              </div>

              <div className="navbar-dropdown-divider" />

              <button
                className="navbar-dropdown-item"
                role="menuitem"
                onClick={handleProfileClick}
              >
                <span className="material-symbols-outlined">person</span>
                Trang cá nhân
              </button>

              <button
                className="navbar-dropdown-item"
                role="menuitem"
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
              >
                <span className="material-symbols-outlined">settings</span>
                Cài đặt
              </button>

              <div className="navbar-dropdown-divider" />

              <button
                className="navbar-dropdown-item navbar-dropdown-item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined">logout</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
