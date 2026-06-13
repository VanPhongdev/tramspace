import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/* ─── Navigation items ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/',          icon: 'home',          iconFill: 'home',          label: 'Trang chủ'  },
  { to: '/explore',   icon: 'explore',       iconFill: 'explore',       label: 'Khám phá'   },
  { to: '/community', icon: 'groups',        iconFill: 'groups',        label: 'Cộng đồng'  },
  { to: '/reels',     icon: 'movie',         iconFill: 'movie',         label: 'Thước phim' },
  { to: '/events',    icon: 'event',         iconFill: 'event',         label: 'Sự kiện'    },
];

const DROPDOWN_ITEMS = [
  { icon: 'person',   label: 'Trang cá nhân', to: '/profile'  },
  { icon: 'settings', label: 'Cài đặt',       to: '/settings' },
];

/* ─── Navbar Component ─────────────────────────────────────────── */
export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue,  setSearchValue]  = useState('');
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

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate('/login');
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
              {/* Placeholder initials */}
              <span>MT</span>
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
                <div className="navbar-dropdown-avatar">
                  <span>MT</span>
                </div>
                <div>
                  <p className="navbar-dropdown-name">Minh Tú</p>
                  <p className="navbar-dropdown-email">mintu@tramspace.com</p>
                </div>
              </div>

              <div className="navbar-dropdown-divider" />

              {DROPDOWN_ITEMS.map(({ icon, label, to }) => (
                <button
                  key={to}
                  className="navbar-dropdown-item"
                  role="menuitem"
                  onClick={() => { navigate(to); setDropdownOpen(false); }}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  {label}
                </button>
              ))}

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
