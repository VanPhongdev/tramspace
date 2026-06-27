import { useState, useRef, useEffect } from 'react';
import UserAvatar from '../UserAvatar';
import api from '../../lib/api';
import PostDetailModal from './PostDetailModal';
import CreatePost from './CreatePost';

/**
 * FeedPost — Post card dùng chung cho HomePage và ProfilePage.
 * Props: post (object), showPinned (bool), currentUser (object), isModalView (bool)
 */
export default function FeedPost({ post, showPinned = false, currentUser, isModalView = false, onFocusComment, onPostDeleted, onPostUpdated }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [saved, setSaved] = useState(post.saved ?? false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [commentCount, setCommentCount] = useState(post.comments ?? 0);
  const [showModal, setShowModal] = useState(false);

  // 3-dot menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Edit modal state (uses CreatePost)
  const [editOpen, setEditOpen] = useState(false);

  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAuthor = currentUser?.id === post.author?.id;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLike = async () => {
    const wasLiked = liked;
    const nextLiked = !wasLiked;
    setLiked(nextLiked);
    setLikeCount((prev) => {
      const num = parseInt(prev, 10) || 0;
      return num + (nextLiked ? 1 : -1);
    });
    try {
      await api.toggleLikePost(post.id);
    } catch (err) {
      console.error('Lỗi khi like bài viết:', err);
      setLiked(wasLiked);
      setLikeCount((prev) => {
        const num = parseInt(prev, 10) || 0;
        return num + (wasLiked ? 1 : -1);
      });
    }
  };

  const toggleSave = async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      await api.toggleSavePost(post.id);
    } catch (err) {
      console.error('Lỗi khi lưu bài viết:', err);
      setSaved(wasSaved);
    }
  };

  const handleEdit = async (content, _files, visibility) => {
    try {
      const updated = await api.updatePost(post.id, { content, visibility });
      setEditOpen(false);
      if (onPostUpdated) onPostUpdated(updated);
    } catch (err) {
      console.error('Lỗi khi chỉnh sửa bài viết:', err);
      throw err; // let CreatePost keep draft
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.deletePost(post.id);
      setDeleteConfirmOpen(false);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      console.error('Lỗi khi xóa bài viết:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <article className="feed-post" style={isModalView ? { margin: 0, borderRadius: 0, border: 'none', boxShadow: 'none' } : {}}>
        {/* Pinned banner */}
        {showPinned && post.pinned && (
          <div className="feed-post-pinned-banner">
            <span className="material-symbols-outlined">push_pin</span>
            <span>Đã ghim</span>
          </div>
        )}

        {/* Header */}
        <div className="feed-post-header">
          <div className="feed-post-author">
            <UserAvatar
              avatarUrl={post.author?.avatarUrl}
              initials={post.author?.initials}
              color={post.author?.color ?? '#006b5f'}
              size={42}
              className="feed-avatar"
            />
            <div>
              <div className="feed-author-meta">
                <span className="feed-author-name">{post.author?.name}</span>
                {post.author?.badge && (
                  <span
                    className="feed-author-badge"
                    style={{ background: `${post.author.badgeColor}22`, color: post.author.badgeColor }}
                  >
                    {post.author.badge}
                  </span>
                )}
              </div>
              <p className="feed-post-time">
                {post.time}
                {post.location && <> • {post.location}</>}
                {post.visibility && (
                  <span className="material-symbols-outlined feed-privacy-icon" style={{ fontSize: 14, marginLeft: 6, verticalAlign: 'middle' }}>
                    {post.visibility === 'PUBLIC' ? 'public' : post.visibility === 'FRIENDS' ? 'group' : 'lock'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 3-dot menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              aria-label="Tùy chọn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 200,
                zIndex: 100,
                overflow: 'hidden',
              }}>
                {/* Lưu bài viết — ai cũng dùng được */}
                <button
                  onClick={() => { toggleSave(); setMenuOpen(false); }}
                  style={menuItemStyle}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: saved ? 'var(--color-primary)' : 'inherit' }}>
                    {saved ? 'bookmark' : 'bookmark_border'}
                  </span>
                  {saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                </button>

                {/* Chỉnh sửa & Xóa — chỉ dành cho tác giả */}
                {isAuthor && (
                  <>
                    <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                    <button
                      onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                      style={menuItemStyle}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                      Chỉnh sửa bài viết
                    </button>
                    <button
                      onClick={() => { setDeleteConfirmOpen(true); setMenuOpen(false); }}
                      style={{ ...menuItemStyle, color: '#e11d48' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#e11d48' }}>delete</span>
                      Xóa bài viết
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="feed-post-content">
          <p>{post.content}</p>
        </div>

        {/* Images grid */}
        {post.hasImage && post.images?.length > 0 && (() => {
          const imgs = post.images;
          const total = imgs.length;
          const shown = Math.min(total, 4);
          const gridMod = total === 1 ? 'fp-images-1'
            : total === 2 ? 'fp-images-2'
            : total === 3 ? 'fp-images-3'
            : 'fp-images-4';

          return (
            <div className={`fp-images ${gridMod}`}>
              {imgs.slice(0, shown).map((url, idx) => (
                <div key={idx} className="fp-image-cell">
                  <img src={url} alt={`Ảnh ${idx + 1}`} />
                  {idx === shown - 1 && total > shown && (
                    <div className="fp-image-more">+{total - shown}</div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Actions */}
        <div className="feed-post-actions">
          <div className="feed-actions-left">
            <button
              className={`feed-action-btn ${liked ? 'liked' : ''}`}
              onClick={toggleLike}
              aria-label="Thích"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
              <span>Thích ({likeCount})</span>
            </button>

            <button
              className="feed-action-btn"
              aria-label="Bình luận"
              onClick={() => {
                if (isModalView && onFocusComment) {
                  onFocusComment();
                } else {
                  setShowModal(true);
                }
              }}
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              <span>Bình luận ({commentCount})</span>
            </button>

            <button className="feed-action-btn secondary" aria-label="Chia sẻ">
              <span className="material-symbols-outlined">share</span>
              <span>Chia sẻ ({post.shares})</span>
            </button>
          </div>

          <button
            className={`icon-btn ${saved ? 'saved' : ''}`}
            onClick={toggleSave}
            aria-label={saved ? 'Bỏ lưu' : 'Lưu bài viết'}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0", color: saved ? 'var(--color-primary)' : undefined }}
            >
              bookmark
            </span>
          </button>
        </div>

        {showModal && !isModalView && (
          <PostDetailModal
            post={post}
            currentUser={currentUser}
            initialCommentCount={commentCount}
            onCommentCountChange={(change) => setCommentCount((prev) => prev + change)}
            onClose={() => setShowModal(false)}
          />
        )}
      </article>

      {/* ── Edit via CreatePost ──────────────────────────────────── */}
      <CreatePost
        isOpen={editOpen}
        currentUser={currentUser}
        editPost={post}
        onSubmit={handleEdit}
        onClose={() => setEditOpen(false)}
      />

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      {deleteConfirmOpen && (
        <div style={overlayStyle} onClick={() => setDeleteConfirmOpen(false)}>
          <div style={{ ...modalStyle, maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#e11d48', marginBottom: 12 }}>delete_forever</span>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Xóa bài viết?</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--color-text-light)', fontSize: 14 }}>
              Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                style={cancelBtnStyle}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{ ...submitBtnStyle, background: '#e11d48' }}
              >
                {deleteLoading ? 'Đang xóa...' : 'Xóa bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */
const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '10px 16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  color: 'var(--color-text)',
  textAlign: 'left',
  transition: 'background 0.15s',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
};

const modalStyle = {
  background: 'var(--color-surface)',
  borderRadius: 16,
  padding: 24,
  width: '100%',
  maxWidth: 520,
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const cancelBtnStyle = {
  padding: '10px 20px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-background)',
  color: 'var(--color-text)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const submitBtnStyle = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
