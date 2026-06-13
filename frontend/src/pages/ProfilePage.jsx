import { useState } from 'react';
import FeedPost from '../components/home/FeedPost';
import {
  profileUser,
  profilePhotos,
  profilePosts,
} from '../data/mockData';

const TABS = ['Bài viết', 'Ảnh', 'Video', 'Đã lưu', 'Giới thiệu', 'Bạn bè'];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Bài viết');
  const user = profileUser; // TODO: fetch from /api/users/:id (useParams)

  return (
    <div className="profile-page">

      {/* ══ HERO: Cover + Avatar + Info ══════════════════════════ */}
      <section className="profile-hero">
        {/* Cover photo — từ /api/users/:id */}
        <div
          className="profile-cover"
          style={{ background: user.coverColor }}
          aria-label="Ảnh bìa"
        />

        <div className="profile-hero-content">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div
              className="profile-avatar"
              style={{ background: user.avatarColor }}
            >
              <span>{user.initials}</span>
            </div>
            {user.isOnline && (
              <span className="profile-online-dot" aria-label="Đang trực tuyến" />
            )}
          </div>

          {/* Name + Actions */}
          <div className="profile-info-row">
            <div>
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-username">
                {user.username} •{' '}
                <span className="profile-role">{user.role}</span>
              </p>
            </div>
            <div className="profile-actions">
              <button className="btn-primary profile-edit-btn">
                <span className="material-symbols-outlined">edit</span>
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
            <p className="profile-bio">{user.bio}</p>

            <div className="profile-details">
              {[
                { icon: 'location_on', text: user.location },
                { icon: 'link',        text: user.website,  link: true },
                { icon: 'calendar_month', text: `Tham gia ${user.joinDate}` },
                { icon: 'work',        text: user.work },
                { icon: 'school',      text: user.education },
              ].map(({ icon, text, link }) => (
                <div key={icon} className="profile-detail-item">
                  <span className="material-symbols-outlined profile-detail-icon">{icon}</span>
                  {link
                    ? <a href="#" className="profile-detail-link">{text}</a>
                    : <span>{text}</span>
                  }
                </div>
              ))}
            </div>

            {/* Stats grid — từ /api/users/:id */}
            <div className="profile-stats-grid">
              {Object.entries({
                'Bài viết':      user.stats.posts,
                'Follower':      user.stats.followers,
                'Following':     user.stats.following,
                'Thích':         user.stats.likes,
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
              {profilePhotos.map((ph) => (
                <button
                  key={ph.id}
                  className="profile-photo-item"
                  style={{ background: ph.color }}
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
              {/* Posts — từ /api/users/:id/posts */}
              {profilePosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={{
                    ...post,
                    author: {
                      name:     profileUser.name,
                      initials: profileUser.initials,
                      color:    profileUser.avatarColor,
                    },
                    liked: false,
                    saved: false,
                  }}
                  showPinned
                />
              ))}
              <div className="load-more-wrap">
                <button className="btn-load-more">Xem thêm bài viết</button>
              </div>
            </div>
          )}

          {activeTab === 'Ảnh' && (
            <div className="profile-photos-tab">
              {/* TODO: fetch /api/users/:id/photos */}
              {profilePhotos.map((ph) => (
                <button
                  key={ph.id}
                  className="profile-photo-tab-item"
                  style={{ background: ph.color }}
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
