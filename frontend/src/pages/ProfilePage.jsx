import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedPost from '../components/home/FeedPost';
import EditProfileModal from '../components/profile/EditProfileModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
  const { handle } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Bài viết')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { user: currentUser, setUser: setAuthUser } = useAuth()
  
  const [savedPosts, setSavedPosts] = useState([])
  const [loadingSaved, setLoadingSaved] = useState(false)

  const isOwnProfile = currentUser && user && currentUser.id === user.id

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    Promise.all([
      api.getUser(handle),
      api.getUserPosts(handle),
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
        setLoading(false)
      })

    return () => { active = false }
  }, [handle])

  useEffect(() => {
    if (activeTab === 'Đã lưu' && isOwnProfile) {
      setLoadingSaved(true)
      api.getSavedPosts()
        .then(data => setSavedPosts(Array.isArray(data) ? data : []))
        .catch(err => console.error(err))
        .finally(() => setLoadingSaved(false))
    }
  }, [activeTab, isOwnProfile])

  /* Sau khi cập nhật profile thành công, nếu username thay đổi thì redirect */
  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser)
    setAuthUser(updatedUser)   // Sync lên AuthContext → Navbar cập nhật ngay
    setIsEditOpen(false)
    const newHandle = updatedUser.username ?? updatedUser.id
    if (newHandle !== handle) {
      navigate(`/profile/${newHandle}`, { replace: true })
    }
  }

  const allPhotos = useMemo(() => {
    const photos = [];
    if (user?.avatarUrl) photos.push({ url: user.avatarUrl, type: 'avatar' });
    if (user?.coverUrl) photos.push({ url: user.coverUrl, type: 'cover' });
    
    posts.forEach(post => {
      if (post.images && post.images.length > 0) {
        post.images.forEach(img => photos.push({ url: img, type: 'post' }));
      }
    });
    
    // Unique URLs
    const unique = [];
    const seen = new Set();
    photos.forEach(p => {
      if (!seen.has(p.url)) {
        seen.add(p.url);
        unique.push(p);
      }
    });
    return unique;
  }, [user, posts]);

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
    username: user.username ? `@${user.username}` : null,
    role: 'Người dùng',
    avatarUrl: user.avatarUrl || null,
    avatarColor: getColorFromId(user.id),
    coverColor: getColorFromId(user.id + '_cover'),
    initials: getInitials(user.displayName || user.email),
    bio: user.bio || 'Chưa có tiểu sử',
    location: user.hometown || user.currentLocation || '',
    website: '',
    work: user.occupation || '',
    education: user.major || '',
    joinDate: new Date(user.createdAt).toLocaleDateString('vi-VN'),
    stats: {
      posts: user.postsCount || 0,
      followers: user.followersCount || 0,
      following: user.followingCount || 0,
      likes: 0,
    },
    isOnline: false,
  }

  const u = profileData

  return (
    <div className="profile-page">

      {/* ══ HERO: Cover + Avatar + Info ══════════════════════════ */}
      <section className="profile-hero">
        {/* Cover photo */}
        <div
          className="profile-cover"
          style={
            user.coverUrl
              ? { backgroundImage: `url(${user.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: u.coverColor }
          }
          aria-label="Ảnh bìa"
        />

        <div className="profile-hero-content">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div
              className="profile-avatar"
              style={u.avatarUrl ? {} : { background: u.avatarColor }}
            >
              {u.avatarUrl
                ? <img src={u.avatarUrl} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span>{u.initials}</span>
              }
            </div>
            {u.isOnline && (
              <span className="profile-online-dot" aria-label="Đang trực tuyến" />
            )}
          </div>

          {/* Name + Actions */}
          <div className="profile-info-row">
            <div>
              <h1 className="profile-name">{u.name}</h1>
              <p className="profile-username">
                {u.username ? (
                  <>{u.username} • <span className="profile-role">{u.role}</span></>
                ) : (
                  <span className="profile-role">{u.role}</span>
                )}
              </p>
            </div>
            <div className="profile-actions">
              <button
                className="btn-primary profile-edit-btn"
                onClick={() => setIsEditOpen(true)}
              >
                <span className="material-symbols-outlined">edit</span>
                {' '}Chỉnh sửa
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

          {/* About card */}
          <div className="profile-about-card">
            <h3 className="profile-card-title">Giới thiệu</h3>
            <p className="profile-bio">{u.bio}</p>

            <div className="profile-details">
              {[
                { icon: 'location_on', text: u.location },
                { icon: 'link', text: u.website, link: true },
                { icon: 'calendar_month', text: `Tham gia ${u.joinDate}` },
                { icon: 'work', text: u.work },
                { icon: 'school', text: u.education },
              ].filter(({ text }) => text).map(({ icon, text, link }) => (
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

            {/* Stats grid */}
            <div className="profile-stats-grid">
              {Object.entries({
                'Bài viết': u.stats.posts,
                'Follower': u.stats.followers,
                'Following': u.stats.following,
                'Thích': u.stats.likes,
              }).map(([label, val]) => (
                <div key={label} className="profile-stat">
                  <strong>{val}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured photos */}
          {allPhotos.length > 0 && (
            <div className="profile-about-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">Ảnh nổi bật</h3>
                <button className="sidebar-link" onClick={() => setActiveTab('Ảnh')}>Xem tất cả</button>
              </div>
              <div className="profile-photos-grid">
                {allPhotos.slice(0, 6).map((photo, i) => (
                  <button
                    key={i}
                    className="profile-photo-item"
                    style={{ backgroundImage: `url(${photo.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    aria-label="Xem ảnh"
                  />
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* ── RIGHT: Tabs + Posts ───────────────────────────────── */}
        <main className="profile-main">

          {/* Tab bar */}
          <nav className="profile-tabs">
            {TABS.filter(tab => tab !== 'Đã lưu' || isOwnProfile).map((tab) => (
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
                      currentUser={currentUser}
                      showPinned
                      onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                      onPostUpdated={(updated) => setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p))}
                    />
                  ))}
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
              {allPhotos.length > 0 ? (
                allPhotos.map((photo, i) => (
                  <button
                    key={i}
                    className="profile-photo-tab-item"
                    style={{ backgroundImage: `url(${photo.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    aria-label="Xem ảnh"
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888', gridColumn: '1 / -1' }}>
                  Chưa có ảnh nào
                </div>
              )}
            </div>
          )}

          {activeTab === 'Đã lưu' && isOwnProfile && (
            <div className="feed-list">
              {loadingSaved ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</div>
              ) : savedPosts && savedPosts.length > 0 ? (
                <>
                  {savedPosts.map((post) => (
                    <FeedPost
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onPostDeleted={(id) => setSavedPosts((prev) => prev.filter((p) => p.id !== id))}
                      onPostUpdated={(updated) => setSavedPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p))}
                    />
                  ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  Chưa có bài viết nào được lưu
                </div>
              )}
            </div>
          )}

          {activeTab === 'Giới thiệu' && (
            <div className="profile-about-tab" style={{ background: 'var(--color-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>Giới thiệu về {u.name}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Cột trái */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: 8, color: 'var(--color-text)' }}>Thông tin cơ bản</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>badge</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Họ và tên</div>
                      <div style={{ fontWeight: 500 }}>{user.displayName || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>alternate_email</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Tên người dùng</div>
                      <div style={{ fontWeight: 500 }}>@{user.username || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>wc</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Giới tính</div>
                      <div style={{ fontWeight: 500 }}>
                        {user.gender === 0 ? 'Nam' : user.gender === 1 ? 'Nữ' : user.gender === 2 ? 'Khác' : 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>cake</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Ngày sinh</div>
                      <div style={{ fontWeight: 500 }}>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>mail</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Email</div>
                      <div style={{ fontWeight: 500 }}>{user.email}</div>
                    </div>
                  </div>
                </div>

                {/* Cột phải */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: 8, color: 'var(--color-text)' }}>Công việc & Học vấn</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>work</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Nghề nghiệp</div>
                      <div style={{ fontWeight: 500 }}>{user.occupation || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>school</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Ngành học / Chuyên môn</div>
                      <div style={{ fontWeight: 500 }}>{user.major || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: 8, marginTop: 12, color: 'var(--color-text)' }}>Nơi sống</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>home</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Quê quán</div>
                      <div style={{ fontWeight: 500 }}>{user.hometown || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-text-light)' }}>location_on</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>Nơi ở hiện tại</div>
                      <div style={{ fontWeight: 500 }}>{user.currentLocation || 'Chưa cập nhật'}</div>
                    </div>
                  </div>
                </div>

                {/* Mạng xã hội */}
                {(user.facebookUrl || user.instagramUrl || user.linkedinUrl || user.githubUrl) && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: 8, color: 'var(--color-text)' }}>Liên kết mạng xã hội</h3>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      {user.facebookUrl && (
                        <a href={user.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1877F2', fontWeight: 500, textDecoration: 'none', background: 'rgba(24,119,242,0.1)', padding: '8px 16px', borderRadius: 20 }}>
                          <span className="material-symbols-outlined">public</span> Facebook
                        </a>
                      )}
                      {user.instagramUrl && (
                        <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E4405F', fontWeight: 500, textDecoration: 'none', background: 'rgba(228,64,95,0.1)', padding: '8px 16px', borderRadius: 20 }}>
                          <span className="material-symbols-outlined">photo_camera</span> Instagram
                        </a>
                      )}
                      {user.linkedinUrl && (
                        <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0A66C2', fontWeight: 500, textDecoration: 'none', background: 'rgba(10,102,194,0.1)', padding: '8px 16px', borderRadius: 20 }}>
                          <span className="material-symbols-outlined">work</span> LinkedIn
                        </a>
                      )}
                      {user.githubUrl && (
                        <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)', fontWeight: 500, textDecoration: 'none', background: 'var(--color-background)', padding: '8px 16px', borderRadius: 20 }}>
                          <span className="material-symbols-outlined">code</span> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!['Bài viết', 'Ảnh', 'Giới thiệu', 'Đã lưu'].includes(activeTab) && (
            <div className="tab-placeholder">
              <span className="material-symbols-outlined">construction</span>
              <p>Nội dung {activeTab.toLowerCase()} đang được xây dựng.</p>
            </div>
          )}

        </main>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        currentUser={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={handleProfileUpdated}
      />
    </div>
  );
}
