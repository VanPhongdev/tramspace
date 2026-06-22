import { Router } from 'express'
import { authenticate, softAuthenticate } from '../../middlewares/auth.middleware.js'
import {
  getPostCommentsHandler,
  getCommentRepliesHandler,
  createCommentHandler,
  createReplyHandler,
  deleteCommentHandler,
  toggleLikeCommentHandler
} from './comments.controller.js'

const router = Router()

// Lấy bình luận cấp 1 của một bài viết
router.get('/post/:postId', softAuthenticate, getPostCommentsHandler)

// Đăng bình luận cấp 1 vào một bài viết (yêu cầu đăng nhập)
router.post('/post/:postId', authenticate, createCommentHandler)

// Lấy danh sách phản hồi (cấp 2) của một bình luận
router.get('/:commentId/replies', softAuthenticate, getCommentRepliesHandler)

// Đăng phản hồi cho một bình luận
router.post('/:commentId/replies', authenticate, createReplyHandler)

// Xóa mềm một bình luận
router.delete('/:commentId', authenticate, deleteCommentHandler)

// Thích / Bỏ thích bình luận
router.post('/:commentId/like', authenticate, toggleLikeCommentHandler)

export default router
