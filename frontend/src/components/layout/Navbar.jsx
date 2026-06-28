import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';
import UserAvatar from '../UserAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

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
  const { user, setUser } = useAuth();
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

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

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await api.logout();
    } catch(e) {
      console.error('Logout failed:', e);
    }
    setUser(null);
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
          <svg viewBox="0 0 36 36" fill="currentColor" height="20" width="20">
            <path d="M18 4C10.268 4 4 9.873 4 17.118c0 4.12 2.052 7.794 5.253 10.222.259.197.435.485.492.81l.666 3.791c.145.827 1.054 1.258 1.77.838l4.13-2.428a1.218 1.218 0 0 1 .918-.124 14.618 14.618 0 0 0 2.766.216c7.732 0 14-5.872 14-13.113C34 9.873 27.732 4 18 4zm3.932 17.534-3.526-3.766a1.25 1.25 0 0 0-1.742-.14l-4.717 3.655c-.752.583-1.73-.284-1.238-1.096l3.968-6.529a1.25 1.25 0 0 1 1.742-.423l3.526 3.766a1.25 1.25 0 0 0 1.742.14l4.717-3.655c.752-.583 1.73.284 1.238 1.096l-3.968 6.529a1.25 1.25 0 0 1-1.742.423z"/>
          </svg>
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
