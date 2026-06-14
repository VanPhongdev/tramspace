import { useEffect, useRef, useState } from 'react';

const MAX_IMAGES = 10;
const GRID_SHOW  = 4;   // số ảnh tối đa hiển thị trong grid

/**
 * CreatePost — Modal tạo bài viết phong cách Facebook.
 * Props: currentUser, onSubmit(content, files[]), isOpen, onClose
 */
export default function CreatePost({ currentUser, onSubmit, isOpen, onClose }) {
  const [text, setText]               = useState('');
  const [imageFiles, setImageFiles]   = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [posting, setPosting]         = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef  = useRef(null);

  /* Auto-focus textarea khi modal mở */
  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 80);
  }, [isOpen]);

  /* Đóng bằng Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  /* ── Handlers ── */
  const handlePost = async () => {
    if (posting || (!text.trim() && imageFiles.length === 0)) return;
    setPosting(true);
    try {
      await onSubmit?.(text, imageFiles);
      resetState();
      onClose?.();
    } catch {
      /* keep draft */
    } finally {
      setPosting(false);
    }
  };

  const handleImageChange = (e) => {
    const selected  = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    const remaining = MAX_IMAGES - imageFiles.length;
    const toAdd     = selected.slice(0, remaining);
    setImageFiles((p)    => [...p, ...toAdd]);
    setImagePreviews((p) => [...p, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const handleRemoveAll = () => {
    imagePreviews.forEach(URL.revokeObjectURL);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleClose = () => {
    onClose?.();
  };

  const resetState = () => {
    imagePreviews.forEach(URL.revokeObjectURL);
    setText('');
    setImageFiles([]);
    setImagePreviews([]);
  };

  /* ── Grid helpers ── */
  const count   = imagePreviews.length;
  const shown   = Math.min(count, GRID_SHOW);
  const extra   = count > GRID_SHOW ? count - GRID_SHOW : 0;
  const gridMod = count === 1 ? 'cp-grid-1'
    : count === 2 ? 'cp-grid-2'
    : count === 3 ? 'cp-grid-3'
    : 'cp-grid-4';

  const canPost = (text.trim().length > 0 || count > 0) && !posting;

  return (
    /* Backdrop */
    <div className="cp-overlay" onClick={handleClose} aria-modal="true" role="dialog">
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="cp-header">
          <h2 className="cp-title">Tạo bài viết</h2>
          <button className="cp-close" onClick={handleClose} aria-label="Đóng">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="cp-hr" />

        {/* ── User row ── */}
        <div className="cp-user-row">
          <div className="feed-avatar" style={{ background: currentUser?.avatarColor ?? '#006b5f' }}>
            <span>{currentUser?.initials ?? 'US'}</span>
          </div>
          <div>
            <p className="cp-user-name">{currentUser?.name ?? 'Người dùng'}</p>
            <button className="cp-privacy-btn" type="button">
              <span className="material-symbols-outlined">lock</span>
              Chỉ mình tôi
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="cp-body">
          <textarea
            ref={textareaRef}
            className="cp-textarea"
            placeholder={`${currentUser?.name ?? 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={count > 0 ? 3 : 6}
            aria-label="Nội dung bài viết"
          />

          {/* ── Image section ── */}
          {count > 0 && (
            <div className="cp-img-section">
              {/* Grid ảnh */}
              <div className={`cp-img-grid ${gridMod}`}>
                {imagePreviews.slice(0, shown).map((src, i) => (
                  <div key={i} className="cp-img-cell">
                    <img src={src} alt={`Ảnh ${i + 1}`} />
                    {i === shown - 1 && extra > 0 && (
                      <div className="cp-img-extra">+{extra}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chỉnh sửa tất cả — góc trên trái */}
              <button
                type="button"
                className="cp-ov-btn cp-ov-edit"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Chỉnh sửa ảnh"
              >
                <span className="material-symbols-outlined">edit</span>
                Chỉnh sửa tất cả
              </button>

              {/* Xóa tất cả — góc trên phải */}
              <button
                type="button"
                className="cp-ov-btn cp-ov-remove"
                onClick={handleRemoveAll}
                aria-label="Xóa tất cả ảnh"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Action bar ── */}
        <div className="cp-action-bar">
          <span className="cp-action-label">Thêm vào bài viết của bạn</span>
          <div className="cp-action-icons">
            <button
              type="button"
              className="cp-icon-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={count >= MAX_IMAGES}
              title="Ảnh/Video"
            >
              <span className="material-symbols-outlined" style={{ color: '#45bd62' }}>image</span>
            </button>
            <button type="button" className="cp-icon-btn" title="Gắn thẻ người">
              <span className="material-symbols-outlined" style={{ color: '#1877f2' }}>group_add</span>
            </button>
            <button type="button" className="cp-icon-btn" title="Cảm xúc/Hoạt động">
              <span className="material-symbols-outlined" style={{ color: '#f7b928' }}>mood</span>
            </button>
            <button type="button" className="cp-icon-btn" title="Check in">
              <span className="material-symbols-outlined" style={{ color: '#f5533d' }}>location_on</span>
            </button>
            <button type="button" className="cp-icon-btn" title="GIF">
              <span className="material-symbols-outlined" style={{ color: '#1877f2' }}>gif_box</span>
            </button>
            <button type="button" className="cp-icon-btn" title="Xem thêm">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
        </div>

        {/* ── Footer: submit ── */}
        <div className="cp-footer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <button
            className="cp-submit"
            onClick={handlePost}
            disabled={!canPost}
            aria-label="Đăng bài viết"
          >
            {posting ? 'Đang đăng...' : 'Đăng'}
          </button>
        </div>
      </div>
    </div>
  );
}
