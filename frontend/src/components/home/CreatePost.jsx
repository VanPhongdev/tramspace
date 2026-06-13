import { useState } from 'react';
import { currentUser } from '../../data/mockData';

/**
 * CreatePost — ô tạo bài viết.
 * onSubmit(content, attachments) — TODO: POST /api/posts
 */
export default function CreatePost({ onSubmit }) {
  const [text, setText] = useState('');

  const handlePost = () => {
    if (!text.trim()) return;
    onSubmit?.(text);
    setText('');
    // TODO: POST /api/posts { content: text }
  };

  return (
    <div className="create-post-card">
      <div className="create-post-top">
        {/* Avatar */}
        <div
          className="feed-avatar"
          style={{ background: currentUser.avatarColor, flexShrink: 0 }}
        >
          <span>{currentUser.initials}</span>
        </div>

        <textarea
          className="create-post-textarea"
          placeholder="Chia sẻ suy nghĩ của bạn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          aria-label="Nội dung bài viết"
        />
      </div>

      <div className="create-post-actions">
        <div className="create-post-media-btns">
          <button className="create-media-btn primary" aria-label="Thêm ảnh">
            <span className="material-symbols-outlined">image</span>
            <span>Ảnh</span>
          </button>
          <button className="create-media-btn secondary" aria-label="Thêm video">
            <span className="material-symbols-outlined">videocam</span>
            <span>Video</span>
          </button>
          <button className="create-media-btn tertiary hide-on-mobile" aria-label="Thêm hoạt động">
            <span className="material-symbols-outlined">mood</span>
            <span>Hoạt động</span>
          </button>
        </div>

        <button
          className="btn-primary create-post-submit"
          onClick={handlePost}
          disabled={!text.trim()}
          aria-label="Đăng bài viết"
        >
          Đăng
        </button>
      </div>
    </div>
  );
}
