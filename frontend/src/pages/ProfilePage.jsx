import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FeedPost from '../components/home/FeedPost';
import api from '../lib/api';

const TABS = ['Bài viết', 'Ảnh', 'Video', 'Đã lưu', 'Giới thiệu', 'Bạn bè'];

const getColorFromId = (id) => {
  const COLORS = ['#14b8a6', '#6063ee', '#f38764', '#4648d4', '#005048', '#e11d48', '#0f766e', '#4f46e5']
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.codePointAt(i)) % COLORS.length
  }
  return COLORS[hash]
}

const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ProfilePage() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Bài viết')

  useEffect(() => {
    let active = true

    Promise.all([
      api.getUser(userId),
      api.getUserPosts(userId),
    ])
      .then(([userData, postsData]) => {
        if (!active) return
        setLoading(false)
        setUser(userData)
        setPosts(Array.isArray(postsData) ? postsData : [])
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data?.error || 'Không thể tải dữ liệu'
        setError(msg)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [userId])

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
          Đang tải profile...
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#e11d48' }}>
          {error || 'Không tìm thấy user'}
        </div>
      </div>
    )
  }

  const profileData = {
    name: user.displayName || user.email,
    username: `@${(user.displayName || user.email).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    role: 'Người dùng',
    avatarColor: getColorFromId(user.id),
    coverColor: getColorFromId(user.id + '_cover'),
    initials: getInitials(user.displayName || user.email),
    bio: user.bio || 'Chưa có tiểu sử',
    location: '',
    website: '',
    work: '',
    education: '',
    joinDate: new Date(user.createdAt).toLocaleDateString('vi-VN'),
    stats: {
      posts: user.postsCount || 0,
      followers: user.followersCount || 0,
      following: user.followingCount || 0,
      likes: 0,
    },
    isOnline: false,
  }

  const user_rendered = profileData

  return (
    <div className="profile-page">

      {/* ══ HERO: Cover + Avatar + Info ══════════════════════════ */}
      <section className="profile-hero">
        {/* Cover photo — từ /api/users/:id */}
        <div
          className="profile-cover"
          style={{ background: user_rendered.coverColor }}
          aria-label="Ảnh bìa"
        />

        <div className="profile-hero-content">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div
              className="profile-avatar"
              style={{ background: user_rendered.avatarColor }}
            >
              <span>{user_rendered.initials}</span>
            </div>
            {user_rendered.isOnline && (
              <span className="profile-online-dot" aria-label="Đang trực tuyến" />
            )}
          </div>

          {/* Name + Actions */}
          <div className="profile-info-row">
            <div>
              <h1 className="profile-name">{user_rendered.name}</h1>
              <p className="profile-username">
                {user_rendered.username} •{' '}
                <span className="profile-role">{user_rendered.role}</span>
              </p>
            </div>
            <div className="profile-actions">
              <button className="btn-primary profile-edit-btn">
                <span className="material-symbols-outlined">edit</span>
              {' '}
                Chỉnh sửa
              </button>
              <button className="icon-btn" aria-label="Chia sẻ">
                <span className="material-symbols-outlined">share</span>
              </button>
              <button className="icon-btn" aria-label="Cài đặt">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BODY: 2-column grid ═══════════════════════════════════ */}
      <div className="profile-body">

        {/* ── LEFT: About + Photos ─────────────────────────────── */}
        <aside className="profile-aside">

          {/* About card — từ /api/users/:id */}
          <div className="profile-about-card">
            <h3 className="profile-card-title">Giới thiệu</h3>
            <p className="profile-bio">{user_rendered.bio}</p>

            <div className="profile-details">
              {[
                { icon: 'location_on', text: user_rendered.location },
                { icon: 'link',        text: user_rendered.website,  link: true },
                { icon: 'calendar_month', text: `Tham gia ${user_rendered.joinDate}` },
                { icon: 'work',        text: user_rendered.work },
                { icon: 'school',      text: user_rendered.education },
              ].map(({ icon, text, link }) => (
                <div key={icon} className="profile-detail-item">
                  <span className="material-symbols-outlined profile-detail-icon">{icon}</span>
                  {link ? (
                    <button type="button" className="profile-detail-link" onClick={() => window.open(text, '_blank')}>
                      {text}
                    </button>
                  ) : (
                    <span>{text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Stats grid — từ /api/users/:id */}
            <div className="profile-stats-grid">
              {Object.entries({
                'Bài viết':      user_rendered.stats.posts,
                'Follower':      user_rendered.stats.followers,
                'Following':     user_rendered.stats.following,
                'Thích':         user_rendered.stats.likes,
              }).map(([label, val]) => (
                <div key={label} className="profile-stat">
                  <strong>{val}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured photos — từ /api/users/:id/photos?featured=true */}
          <div className="profile-about-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Ảnh nổi bật</h3>
              <button className="sidebar-link">Xem tất cả</button>
            </div>
            <div className="profile-photos-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <button
                  key={i}
                  className="profile-photo-item"
                  style={{ background: getColorFromId(user.id + `_photo${i}`) }}
                  aria-label="Xem ảnh"
                />
              ))}
            </div>
          </div>

        </aside>

        {/* ── RIGHT: Tabs + Posts ───────────────────────────────── */}
        <main className="profile-main">

          {/* Tab bar */}
          <nav className="profile-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          {activeTab === 'Bài viết' && (
            <div className="feed-list">
              {posts && posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <FeedPost
                      key={post.id}
                      post={post}
                      showPinned
                    />
                  ))}
                  <div className="load-more-wrap">
                    <button className="btn-load-more">Xem thêm bài viết</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  Chưa có bài viết nào
                </div>
              )}
            </div>
          )}

          {activeTab === 'Ảnh' && (
            <div className="profile-photos-tab">
              {/* Mock photos for now */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <button
                  key={i}
                  className="profile-photo-tab-item"
                  style={{ background: getColorFromId(user.id + `_tab${i}`) }}
                  aria-label="Xem ảnh"
                />
              ))}
            </div>
          )}

          {!['Bài viết', 'Ảnh'].includes(activeTab) && (
            <div className="tab-placeholder">
              <span className="material-symbols-outlined">construction</span>
              <p>Nội dung {activeTab.toLowerCase()} đang được xây dựng.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
