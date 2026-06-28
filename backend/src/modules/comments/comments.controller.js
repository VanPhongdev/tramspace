import * as commentsService from './comments.service.js'

export const getPostCommentsHandler = async (req, res, next) => {
  try {
    const { postId } = req.params
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 50)
    const offset = Number.parseInt(req.query.offset, 10) || 0
    const requesterId = req.user?.userId

    const comments = await commentsService.getPostComments(postId, limit, offset, requesterId)
    res.json({ success: true, data: comments })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message })
    next(err)
  }
}

export const getCommentRepliesHandler = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 50)
    const offset = Number.parseInt(req.query.offset, 10) || 0
    const requesterId = req.user?.userId

    const replies = await commentsService.getCommentReplies(commentId, limit, offset, requesterId)
    res.json({ success: true, data: replies })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message })
    next(err)
  }
}

export const createCommentHandler = async (req, res, next) => {
  try {
    const { postId } = req.params
    const { content } = req.body
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Nội dung không được rỗng' })

    const comment = await commentsService.createComment(req.user.userId, postId, content)
    res.json({ success: true, data: comment })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message })
    next(err)
  }
}

export const createReplyHandler = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const { content } = req.body
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Nội dung không được rỗng' })

    const reply = await commentsService.createReply(req.user.userId, commentId, content)
    res.json({ success: true, data: reply })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message })
    next(err)
  }
}

export const deleteCommentHandler = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const deleted = await commentsService.deleteComment(req.user.userId, commentId)
    res.json({ success: true, data: deleted })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message })
    next(err)
  }
}

export const toggleLikeCommentHandler = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const result = await commentsService.toggleLikeComment(req.user.userId, commentId)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message })
    next(err)
  }
}
