import { useState } from 'react';

/**
 * FeedPost — Post card dùng chung cho HomePage và ProfilePage.
 * Props: post (object), showPinned (bool), compact (bool)
 */
export default function FeedPost({ post, showPinned = false }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [saved, setSaved] = useState(post.saved ?? false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);

  const toggleLike = () => {
    setLiked((currentLiked) => {
      const nextLiked = !currentLiked;
      setLikeCount((count) => count + (nextLiked ? 1 : -1));
      return nextLiked;
    });
  };

  const toggleSave = () => {
    setSaved((currentSaved) => !currentSaved);
  };

  return (
    <article className="feed-post">
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
          {/* Avatar */}
          <div
            className="feed-avatar"
            style={{ background: post.author?.color ?? '#006b5f' }}
          >
            <span>{post.author?.initials}</span>
          </div>

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
              {post.privacy && (
                <span className="material-symbols-outlined feed-privacy-icon">
                  {post.privacy === 'public' ? 'public' : post.privacy === 'friends' ? 'group' : 'lock'}
                </span>
              )}
            </p>
          </div>
        </div>

        <button className="icon-btn" aria-label="Tùy chọn">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Content */}
      <div className="feed-post-content">
        <p>{post.content}</p>
      </div>

      {/* Images grid */}
      {post.hasImage && post.images?.length > 0 && (() => {
        const imgs = post.images
        const total = imgs.length
        const shown = Math.min(total, 4)
        const gridMod = total === 1 ? 'fp-images-1'
          : total === 2 ? 'fp-images-2'
          : total === 3 ? 'fp-images-3'
          : 'fp-images-4'

        return (
          <div className={`fp-images ${gridMod}`}>
            {imgs.slice(0, shown).map((url, idx) => (
              <div key={idx} className="fp-image-cell">
                <img src={url} alt={`Ảnh ${idx + 1}`} />
                {/* Overlay "+N" trên ô cuối nếu còn ảnh nữa */}
                {idx === shown - 1 && total > shown && (
                  <div className="fp-image-more">+{total - shown}</div>
                )}
              </div>
            ))}
          </div>
        )
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

          <button className="feed-action-btn" aria-label="Bình luận">
            <span className="material-symbols-outlined">chat_bubble</span>
            <span>Bình luận ({post.comments})</span>
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
    </article>
  );
}
