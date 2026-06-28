import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../UserAvatar';
import api from '../../lib/api';
import FeedPost from './FeedPost';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function PostDetailModal({ post, currentUser, onClose, initialCommentCount, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const toast = useToast();
  const confirm = useConfirm();
  const [posting, setPosting] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // Focus ref for input
  const inputRef = useRef(null);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Load comments
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getPostComments(post.id)
      .then(data => {
        if (active) setComments(data);
      })
      .catch(err => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [post.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const newComment = await api.createComment(post.id, content);
      setComments(prev => [newComment, ...prev]);
      setContent('');
      setCommentCount(prev => prev + 1);
      onCommentCountChange?.(1);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi khi gửi bình luận');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    const isConfirmed = await confirm({
      title: 'Xóa bình luận',
      message: 'Bạn có chắc chắn muốn xóa bình luận này?',
      confirmText: 'Xóa',
      danger: true,
    });
    if (!isConfirmed) return;
    try {
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      if (onCommentCountChange) onCommentCountChange(-1);
      toast.success('Đã xóa bình luận');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi xóa bình luận');
    }
  };

  // Close when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.className === 'post-detail-overlay') {
      onClose();
    }
  };

  return (
    <div className="post-detail-overlay" onClick={handleOverlayClick} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(244, 244, 245, 0.8)', // Trắng đục
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 0'
    }}>
      <div className="post-detail-modal" style={{
        width: '100%',
        maxWidth: 700,
        height: '100%',
        maxHeight: '90vh',
        backgroundColor: 'var(--color-background)',
        borderRadius: 12,
        boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)',
          zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, flex: 1, textAlign: 'center' }}>
            Bài viết của {post.author?.name || 'Người dùng'}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: '#e4e6eb',
              border: 'none',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#050505',
              position: 'absolute',
              right: 16
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }} className="custom-scrollbar">
          {/* Post Content rendered without bottom margin/radius using isModalView */}
          <div style={{ borderBottom: '1px solid var(--color-border)' }}>
            <FeedPost post={post} currentUser={currentUser} isModalView={true} onFocusComment={() => inputRef.current?.focus()} />
          </div>

          {/* Comments List */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 16 }}>
              Phù hợp nhất <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle' }}>arrow_drop_down</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-light)' }}>Đang tải bình luận...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {comments.map(c => (
                  <CommentItem 
                    key={c.id} 
                    comment={c} 
                    currentUser={currentUser} 
                    onDelete={() => handleDelete(c.id)}
                  />
                ))}
                {comments.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-light)', padding: 20 }}>
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer for Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)',
          zIndex: 10
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <UserAvatar
              avatarUrl={currentUser?.avatarUrl}
              initials={currentUser?.initials || 'US'}
              color={currentUser?.avatarColor || currentUser?.color || '#006b5f'}
              size={36}
            />
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: '#f0f2f5', borderRadius: 20, padding: '0 12px' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Viết bình luận..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={posting}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 15
                }}
              />
              <div style={{ display: 'flex', gap: 4, color: 'var(--color-text-light)' }}>
                <span className="material-symbols-outlined" style={{ cursor: 'pointer', fontSize: 20 }}>sentiment_satisfied</span>
                <span className="material-symbols-outlined" style={{ cursor: 'pointer', fontSize: 20 }}>photo_camera</span>
                <span className="material-symbols-outlined" style={{ cursor: 'pointer', fontSize: 20 }}>gif_box</span>
                <span className="material-symbols-outlined" style={{ cursor: 'pointer', fontSize: 20 }}>sticky_note_2</span>
              </div>
              <button 
                type="submit" 
                disabled={!content.trim() || posting}
                style={{ 
                  background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer',
                  opacity: content.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', marginLeft: 8
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, currentUser, onDelete }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [postingReply, setPostingReply] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const replyInputRef = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();

  const [liked, setLiked] = useState(comment.liked ?? false);
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0);

  const handleLikeComment = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => prev + (wasLiked ? -1 : 1));
    try {
      await api.toggleLikeComment(comment.id);
    } catch (err) {
      console.error(err);
      setLiked(wasLiked);
      setLikeCount(prev => prev + (wasLiked ? 1 : -1));
    }
  };

  const loadReplies = async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const data = await api.getCommentReplies(comment.id);
      setReplies(data);
      setShowReplies(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
    if (!showReplyInput && !showReplies && comment.replyCount > 0) {
      loadReplies();
    }
    setTimeout(() => replyInputRef.current?.focus(), 100);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || postingReply) return;
    setPostingReply(true);
    try {
      const newReply = await api.createReply(comment.id, replyContent);
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
      setShowReplyInput(false);
      setShowReplies(true);
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi khi gửi phản hồi');
    } finally {
      setPostingReply(false);
    }
  };

  const handleReplyDelete = async (replyId) => {
    const isConfirmed = await confirm({
      title: 'Xóa phản hồi',
      message: 'Bạn có chắc chắn muốn xóa phản hồi này?',
      confirmText: 'Xóa',
      danger: true,
    });
    if (!isConfirmed) return;
    try {
      await api.deleteComment(replyId);
      setReplies(prev => prev.filter(r => r.id !== replyId));
      toast.success('Đã xóa phản hồi');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi xóa phản hồi');
    }
  };

  if (comment.isDeleted) {
    return (
      <div style={{ display: 'flex', gap: 8, opacity: 0.6 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee' }} />
        <div>
          <div style={{ background: '#f0f2f5', padding: '8px 12px', borderRadius: 18, fontSize: 14, fontStyle: 'italic' }}>
            {comment.content}
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser?.id === comment.author?.id;
  const navigate = useNavigate();
  const goToProfile = () => {
    const handle = comment.author?.username || comment.author?.id;
    if (handle) navigate(`/profile/${handle}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Avatar — click để xem profile */}
        <span onClick={goToProfile} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <UserAvatar
            avatarUrl={comment.author?.avatarUrl}
            initials={comment.author?.initials}
            color={comment.author?.color}
            size={36}
          />
        </span>
        <div>
          <div style={{ background: '#f0f2f5', padding: '8px 12px', borderRadius: 18, fontSize: 15 }}>
            {/* Tên — click để xem profile */}
            <div
              style={{ fontWeight: 600, marginBottom: 2, cursor: 'pointer', display: 'inline-block' }}
              onClick={goToProfile}
            >
              {comment.author?.name}
            </div>
            <div>{comment.content}</div>
          </div>
          <div style={{ display: 'flex', gap: 16, paddingLeft: 12, marginTop: 4, fontSize: 13, color: 'var(--color-text-light)', fontWeight: 600 }}>
            <span style={{ fontWeight: 'normal' }}>{comment.time}</span>
            <span 
              style={{ fontWeight: liked ? 600 : 'normal', color: liked ? 'var(--color-primary)' : 'inherit', cursor: 'pointer' }}
              onClick={handleLikeComment}
            >
              Thích {likeCount > 0 && `(${likeCount})`}
            </span>
            <button style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }} onClick={handleReplyClick}>
              Phản hồi
            </button>
            {isAuthor && (
              <button style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }} onClick={onDelete}>
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.replyCount > 0 && !showReplies && (
        <button 
          onClick={loadReplies} 
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text-light)', fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left', marginLeft: 44, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>subdirectory_arrow_right</span>
          {loadingReplies ? 'Đang tải...' : `Xem ${comment.replyCount} phản hồi`}
        </button>
      )}

      {showReplyInput && (
        <form onSubmit={handleReplySubmit} style={{ display: 'flex', gap: 8, marginTop: 8, marginLeft: 44 }}>
          <UserAvatar
            avatarUrl={currentUser?.avatarUrl}
            initials={currentUser?.initials || 'US'}
            color={currentUser?.avatarColor || currentUser?.color || '#006b5f'}
            size={24}
          />
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: '#f0f2f5', borderRadius: 16, padding: '0 10px' }}>
            <input
              ref={replyInputRef}
              type="text"
              placeholder={`Phản hồi ${comment.author?.name}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={postingReply}
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 14
              }}
            />
          </div>
        </form>
      )}

      {showReplies && replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8, marginLeft: 44 }}>
          {replies.map(reply => (
            <ReplyItem 
              key={reply.id} 
              reply={reply} 
              currentUser={currentUser} 
              onDelete={() => handleReplyDelete(reply.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyItem({ reply, currentUser, onDelete }) {
  const [liked, setLiked] = useState(reply.liked ?? false);
  const [likeCount, setLikeCount] = useState(reply.likeCount ?? 0);

  const handleLikeReply = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => prev + (wasLiked ? -1 : 1));
    try {
      await api.toggleLikeComment(reply.id);
    } catch (err) {
      console.error(err);
      setLiked(wasLiked);
      setLikeCount(prev => prev + (wasLiked ? 1 : -1));
    }
  };

  if (reply.isDeleted) {
    return (
      <div style={{ display: 'flex', gap: 8, opacity: 0.6 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eee' }} />
        <div>
          <div style={{ background: '#f0f2f5', padding: '6px 10px', borderRadius: 16, fontSize: 13, fontStyle: 'italic' }}>
            {reply.content}
          </div>
        </div>
      </div>
    );
  }

  const isReplyAuthor = currentUser?.id === reply.author?.id;
  const navigate = useNavigate();
  const goToProfile = () => {
    const handle = reply.author?.username || reply.author?.id;
    if (handle) navigate(`/profile/${handle}`);
  };
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span onClick={goToProfile} style={{ cursor: 'pointer', flexShrink: 0 }}>
        <UserAvatar
          avatarUrl={reply.author?.avatarUrl}
          initials={reply.author?.initials}
          color={reply.author?.color}
          size={28}
        />
      </span>
      <div>
        <div style={{ background: '#f0f2f5', padding: '6px 12px', borderRadius: 16, fontSize: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 2, cursor: 'pointer', display: 'inline-block' }} onClick={goToProfile}>{reply.author?.name}</div>
          <div>{reply.content}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, paddingLeft: 10, marginTop: 4, fontSize: 12, color: 'var(--color-text-light)', fontWeight: 600 }}>
          <span style={{ fontWeight: 'normal' }}>{reply.time}</span>
          <span 
            style={{ fontWeight: liked ? 600 : 'normal', color: liked ? 'var(--color-primary)' : 'inherit', cursor: 'pointer' }}
            onClick={handleLikeReply}
          >
            Thích {likeCount > 0 && `(${likeCount})`}
          </span>
          {isReplyAuthor && (
            <button style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }} onClick={onDelete}>
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
