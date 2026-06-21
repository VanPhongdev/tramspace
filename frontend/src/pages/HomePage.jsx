import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import StoryStrip from '../components/home/StoryStrip';
import CreatePost from '../components/home/CreatePost';
import FeedPost from '../components/home/FeedPost';
import UserAvatar from '../components/UserAvatar';

import api from '../lib/api';

/* ─── Left sidebar nav items ────────────────────────────────────── */
const sidebarNav = [
  { to: '/', icon: 'home', label: 'Trang chủ', exact: true },
  { to: '/explore', icon: 'explore', label: 'Khám phá' },
  { to: '/community', icon: 'groups', label: 'Cộng đồng' },
  { to: '/saved', icon: 'bookmark', label: 'Đã lưu' },
  { to: '/events', icon: 'event', label: 'Sự kiện' },
];

export default function HomePage() {
  const navigate = useNavigate()
  const [homeData, setHomeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialFiles, setInitialFiles] = useState([])
  const quickFileRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.getHome()
      .then((home) => {
        if (!active) return
        setHomeData(home)
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data?.error || 'Không thể tải dữ liệu trang chủ'
        setError(msg)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  /* Chọn ảnh nhanh từ nút Ảnh/Video -> mở modal với ảnh đã chọn */
  const handleQuickImageSelect = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setInitialFiles(files);
    setIsModalOpen(true);
    e.target.value = '';
  };

  const handleNewPost = async (content, imageFiles, visibility = 'PUBLIC') => {
    setError(null)
    try {
      const newPost = await api.createPost(content, imageFiles, visibility)
      setHomeData((prev) => ({
        ...prev,
        feedPosts: [newPost, ...(prev?.feedPosts ?? [])],
      }))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Không thể đăng bài'
      setError(msg)
    }
  }

  if (loading) {
    return (
      <div className="home-layout">
        <div className="home-loading">Đang tải trang chủ...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-layout">
        <div className="home-error">{error}</div>
      </div>
    )
  }

  const {
    currentUser = {},
    stories = [],
    feedPosts = [],
    trendingTopics = [],
    suggestions = [],
    onlineFriends = [],
  } = homeData || {}

  return (
    <div className="home-layout">

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════ */}
      <aside className="home-sidebar-left">

        {/* User mini card */}
        <div className="user-mini-card">
          <div className="user-mini-top">
            <button
              type="button"
              className="user-mini-avatar"
              onClick={() => navigate(`/profile/${currentUser.username ?? currentUser.id}`)}
              aria-label="Xem trang cá nhân"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <UserAvatar
                avatarUrl={currentUser.avatarUrl}
                initials={currentUser.initials ?? 'US'}
                color={currentUser.avatarColor ?? '#006b5f'}
                size={48}
              />
            </button>
            <div>
              <p className="user-mini-name">{currentUser.name}</p>
              <p className="user-mini-username">{currentUser.username ? `@${currentUser.username}` : ''}</p>
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
          <button type="button" className="sidebar-nav-sm">
            <span className="material-symbols-outlined">shield</span>
            <span>Quyền riêng tư</span>
          </button>
        </div>
      </aside>

      {/* ══ CENTER FEED ════════════════════════════════════════════ */}
      <section className="home-center-feed">
        {/* Stories — từ /api/stories/feed */}
        <StoryStrip stories={stories} />

        {/* Trigger card — click để mở modal */}
        <div className="create-post-trigger">
          <div className="cpt-top">
            <UserAvatar
              avatarUrl={currentUser.avatarUrl}
              initials={currentUser.initials ?? 'US'}
              color={currentUser.avatarColor ?? '#006b5f'}
              size={40}
              className="feed-avatar"
              style={{ flexShrink: 0 }}
            />
            <button
              className="cpt-input-btn"
              onClick={() => setIsModalOpen(true)}
              aria-label="Tạo bài viết"
            >
              {currentUser.name} ơi, bạn đang nghĩ gì thế?
            </button>
          </div>
          <div className="cpt-divider" />
          <div className="cpt-actions">
            {/* File input ẩn để chọn ảnh nhanh */}
            <input
              ref={quickFileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleQuickImageSelect}
            />
            <button className="cpt-action" onClick={() => quickFileRef.current?.click()}>
              <span className="material-symbols-outlined" style={{ color: '#45bd62' }}>image</span>
              Ảnh/Video
            </button>
            <button className="cpt-action">
              <span className="material-symbols-outlined" style={{ color: '#f7b928' }}>mood</span>
              Cảm xúc
            </button>
            <button className="cpt-action">
              <span className="material-symbols-outlined" style={{ color: '#f5533d' }}>location_on</span>
              Check in
            </button>
          </div>
        </div>

        {/* Modal tạo bài viết */}
        <CreatePost
          currentUser={currentUser}
          onSubmit={handleNewPost}
          isOpen={isModalOpen}
          initialFiles={initialFiles}
          onClose={() => { setIsModalOpen(false); setInitialFiles([]); }}
        />

        {/* Feed — từ /api/feed */}
        <div className="feed-list">
          {feedPosts?.map((post) => (
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
            {trendingTopics?.map((t) => (
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
            {suggestions?.map((s) => (
              <div key={s.id} className="suggest-item">
                <div className="suggest-info">
                  <UserAvatar
                    avatarUrl={s.avatarUrl}
                    initials={s.initials}
                    color={s.color}
                    size={38}
                    className="suggest-avatar"
                  />
                  <div>
                    <p className="suggest-name">{s.name}</p>
                    <p className="suggest-reason">{s.reason}</p>
                  </div>
                </div>
                <button
                  className="btn-follow"
                  onClick={() => console.log('Follow', s.id)}
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
            {onlineFriends?.map((f) => (
              <button key={f.id} className="online-item">
                <div className="online-avatar-wrap">
                  <UserAvatar
                    avatarUrl={f.avatarUrl}
                    initials={f.initials}
                    color={f.color}
                    size={32}
                    className="suggest-avatar"
                  />
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
