import { useEffect, useRef, useState } from 'react';
import UserAvatar from '../UserAvatar';

const MAX_IMAGES = 10;
const GRID_SHOW  = 4;

/**
 * CreatePost — Modal tạo/chỉnh sửa bài viết phong cách Facebook.
 * Props:
 *   currentUser, onSubmit(content, files[], visibility), isOpen, onClose,
 *   initialFiles[]    — ảnh File để tạo mới
 *   editPost          — object bài viết cần chỉnh sửa (chế độ edit)
 */
export default function CreatePost({ currentUser, onSubmit, isOpen, onClose, initialFiles = [], editPost = null }) {
  const isEditMode = !!editPost;

  const [text, setText]                   = useState('');
  const [imageFiles, setImageFiles]       = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [visibility, setVisibility]       = useState('PUBLIC');
  const [posting, setPosting]             = useState(false);

  // Confirm-discard dialog
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef  = useRef(null);

  /* Khi modal mở: load dữ liệu tương ứng */
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode) {
      // Chế độ chỉnh sửa: điền nội dung bài viết cũ
      setText(editPost.content ?? '');
      setVisibility(editPost.visibility ?? 'PUBLIC');
      // Hiển thị ảnh hiện có dưới dạng URL (không phải File)
      setImageFiles([]);
      setImagePreviews(editPost.images ?? []);
    } else {
      // Chế độ tạo mới
      setText('');
      setVisibility('PUBLIC');
      if (initialFiles.length > 0) {
        setImageFiles(initialFiles);
        setImagePreviews(initialFiles.map((f) => URL.createObjectURL(f)));
      } else {
        setImageFiles([]);
        setImagePreviews([]);
      }
    }
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, [isOpen]);

  /* Đóng bằng Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, text, imageFiles]);

  if (!isOpen) return null;

  /* ── Kiểm tra có thay đổi không (chế độ edit) ── */
  const hasChanges = isEditMode
    ? (text !== (editPost.content ?? '') || visibility !== (editPost.visibility ?? 'PUBLIC') || imageFiles.length > 0)
    : (text.trim().length > 0 || imageFiles.length > 0);

  /* ── Handlers ── */
  const handlePost = async () => {
    if (posting || (!text.trim() && imageFiles.length === 0 && imagePreviews.length === 0)) return;
    setPosting(true);
    try {
      await onSubmit?.(text, imageFiles, visibility);
      resetState();
      onClose?.();
    } catch {
      /* keep draft */
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      resetState();
      onClose?.();
    }
  };

  const handleDiscardConfirm = () => {
    setShowDiscardDialog(false);
    resetState();
    onClose?.();
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
    // Chỉ revoke URL cho file mới (blob://), URL ảnh cũ không cần revoke
    imageFiles.forEach(URL.revokeObjectURL);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const resetState = () => {
    imageFiles.forEach((f) => {
      if (typeof f !== 'string') URL.revokeObjectURL(f);
    });
    setText('');
    setImageFiles([]);
    setImagePreviews([]);
    setVisibility('PUBLIC');
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
    <>
      {/* ── Main Modal ── */}
      <div className="cp-overlay" onClick={handleClose} aria-modal="true" role="dialog">
        <div className="cp-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="cp-header">
            <h2 className="cp-title">{isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}</h2>
            <button className="cp-close" onClick={handleClose} aria-label="Đóng">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="cp-hr" />

          {/* User row */}
          <div className="cp-user-row">
            <UserAvatar
              avatarUrl={currentUser?.avatarUrl}
              initials={currentUser?.initials ?? 'US'}
              color={currentUser?.avatarColor ?? '#006b5f'}
              size={42}
              className="feed-avatar"
            />
            <div>
              <p className="cp-user-name">{currentUser?.name ?? 'Người dùng'}</p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="cp-privacy-btn"
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    paddingLeft: 24,
                    paddingRight: 24,
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="FRIENDS">Bạn bè</option>
                  <option value="PRIVATE">Chỉ mình tôi</option>
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 14 }}>
                  {visibility === 'PUBLIC' ? 'public' : visibility === 'FRIENDS' ? 'group' : 'lock'}
                </span>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 16 }}>
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
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

            {count > 0 && (
              <div className="cp-img-section">
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
                <button type="button" className="cp-ov-btn cp-ov-edit" onClick={() => fileInputRef.current?.click()} aria-label="Chỉnh sửa ảnh">
                  <span className="material-symbols-outlined">edit</span>
                  Chỉnh sửa tất cả
                </button>
                <button type="button" className="cp-ov-btn cp-ov-remove" onClick={handleRemoveAll} aria-label="Xóa tất cả ảnh">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="cp-action-bar">
            <span className="cp-action-label">Thêm vào bài viết của bạn</span>
            <div className="cp-action-icons">
              <button type="button" className="cp-icon-btn" onClick={() => fileInputRef.current?.click()} disabled={count >= MAX_IMAGES} title="Ảnh/Video">
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

          {/* Footer */}
          <div className="cp-footer">
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageChange} />
            <button className="cp-submit" onClick={handlePost} disabled={!canPost} aria-label={isEditMode ? 'Lưu bài viết' : 'Đăng bài viết'}>
              {posting
                ? (isEditMode ? 'Đang lưu...' : 'Đang đăng...')
                : (isEditMode ? 'Lưu' : 'Đăng')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Discard Confirm Dialog ── */}
      {showDiscardDialog && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Semi-transparent backdrop on top of the modal */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{
            position: 'relative',
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '24px 24px 20px',
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Close X */}
            <button
              onClick={() => setShowDiscardDialog(false)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'var(--color-background)', border: 'none',
                borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text)',
              }}
              aria-label="Đóng hộp thoại"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, paddingRight: 36 }}>
              Thay đổi chưa lưu
            </h3>
            <p style={{ margin: '0 0 24px', color: 'var(--color-text-light)', fontSize: 14 }}>
              Hệ thống sẽ không lưu các thay đổi của bạn.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                onClick={() => setShowDiscardDialog(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', padding: '8px 12px',
                }}
              >
                Tiếp tục chỉnh sửa
              </button>
              <button
                onClick={handleDiscardConfirm}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: 'var(--color-primary)', color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
