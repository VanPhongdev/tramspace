import { NavLink } from 'react-router-dom';
import StoryStrip from '../components/home/StoryStrip';
import CreatePost from '../components/home/CreatePost';
import FeedPost   from '../components/home/FeedPost';

import {
  currentUser,
  stories,
  feedPosts,
  trendingTopics,
  suggestions,
  onlineFriends,
} from '../data/mockData';

/* ─── Left sidebar nav items ────────────────────────────────────── */
const sidebarNav = [
  { to: '/',          icon: 'home',     label: 'Trang chủ',  exact: true },
  { to: '/explore',   icon: 'explore',  label: 'Khám phá'               },
  { to: '/community', icon: 'groups',   label: 'Cộng đồng'              },
  { to: '/saved',     icon: 'bookmark', label: 'Đã lưu'                 },
  { to: '/events',    icon: 'event',    label: 'Sự kiện'                },
];

export default function HomePage() {
  const handleNewPost = (content) => {
    console.log('New post:', content);
    // TODO: POST /api/posts
  };

  return (
    <div className="home-layout">

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════ */}
      <aside className="home-sidebar-left">

        {/* User mini card */}
        <div className="user-mini-card">
          <div className="user-mini-top">
            <div
              className="user-mini-avatar"
              style={{ background: currentUser.avatarColor }}
            >
              <span>{currentUser.initials}</span>
            </div>
            <div>
              <p className="user-mini-name">{currentUser.name}</p>
              <p className="user-mini-username">{currentUser.username}</p>
            </div>
          </div>
          <div className="user-mini-stats">
            <div className="user-mini-stat">
              <strong>{currentUser.following}</strong>
              <span>Đang theo dõi</span>
            </div>
            <div className="user-mini-stat">
              <strong>{currentUser.followers}</strong>
              <span>Người theo dõi</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sidebarNav.map(({ to, icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="sidebar-nav-bottom">
          <NavLink to="/settings" className="sidebar-nav-sm">
            <span className="material-symbols-outlined">settings</span>
            <span>Cài đặt</span>
          </NavLink>
          <a href="#" className="sidebar-nav-sm">
            <span className="material-symbols-outlined">shield</span>
            <span>Quyền riêng tư</span>
          </a>
        </div>
      </aside>

      {/* ══ CENTER FEED ════════════════════════════════════════════ */}
      <section className="home-center-feed">
        {/* Stories — từ /api/stories/feed */}
        <StoryStrip stories={stories} />

        {/* Create post */}
        <CreatePost onSubmit={handleNewPost} />

        {/* Feed — từ /api/feed */}
        <div className="feed-list">
          {feedPosts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* ══ RIGHT SIDEBAR ══════════════════════════════════════════ */}
      <aside className="home-sidebar-right">

        {/* Trending — từ /api/trending */}
        <div className="sidebar-card">
          <h3 className="sidebar-card-title">Xu hướng cho bạn</h3>
          <div className="trending-list">
            {trendingTopics.map((t) => (
              <button key={t.id} className="trending-item">
                <div className="trending-meta">
                  <span>{t.category}</span>
                  <span className="material-symbols-outlined">more_horiz</span>
                </div>
                <p className="trending-tag">{t.tag}</p>
                <p className="trending-count">{t.posts} bài đăng</p>
              </button>
            ))}
          </div>
          <button className="sidebar-link">Xem thêm</button>
        </div>

        {/* Gợi ý — từ /api/users/suggestions */}
        <div className="sidebar-card">
          <h3 className="sidebar-card-title">Gợi ý</h3>
          <div className="suggest-list">
            {suggestions.map((s) => (
              <div key={s.id} className="suggest-item">
                <div className="suggest-info">
                  <div
                    className="suggest-avatar"
                    style={{ background: s.color }}
                  >
                    <span>{s.initials}</span>
                  </div>
                  <div>
                    <p className="suggest-name">{s.name}</p>
                    <p className="suggest-reason">{s.reason}</p>
                  </div>
                </div>
                <button
                  className="btn-follow"
                  onClick={() => console.log('Follow', s.id)}
                  // TODO: POST /api/users/:id/follow
                >
                  Theo dõi
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bạn bè trực tuyến — từ /api/friends/online */}
        <div className="sidebar-card">
          <div className="sidebar-card-header">
            <h3 className="sidebar-card-title">Bạn bè trực tuyến</h3>
            <span className="online-badge">{onlineFriends.length} đang trực tuyến</span>
          </div>
          <div className="online-list">
            {onlineFriends.map((f) => (
              <button key={f.id} className="online-item">
                <div className="online-avatar-wrap">
                  <div
                    className="suggest-avatar"
                    style={{ background: f.color, width: 32, height: 32, fontSize: 12 }}
                  >
                    <span>{f.initials}</span>
                  </div>
                  <span className="online-dot" />
                </div>
                <span className="online-name">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

      </aside>
    </div>
  );
}
