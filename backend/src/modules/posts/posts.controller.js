import * as postsService from './posts.service.js'
import prisma from '../../lib/prisma.js'

// UUID regex — phân biệt handle là UUID hay username
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Resolve handle (UUID hoặc username) → userId thực
const resolveUserId = async (handle) => {
  if (UUID_REGEX.test(handle)) return handle
  // Tìm user theo username
  const user = await prisma.user.findUnique({
    where: { username: handle },
    select: { id: true },
  })
  if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' }
  return user.id
}

export const getUserPostsHandler = async (req, res, next) => {
  try {
    const handle = req.params.id
    const limit  = Math.min(Number.parseInt(req.query.limit, 10) || 10, 100)
    const offset = Number.parseInt(req.query.offset, 10) || 0

    const userId = await resolveUserId(handle)
    const requesterId = req.user?.userId
    const posts  = await postsService.getUserPosts(userId, limit, offset, requesterId)
    res.json({ success: true, data: posts })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message })
    next(err)
  }
}

export const getPostHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await postsService.getPost(id)
    res.json({ success: true, data: post })
  } catch (err) {
    next(err)
  }
}

export const createPostHandler = async (req, res, next) => {
  try {
    // req.user.userId được set bởi authenticate middleware
    // req.files là mảng file từ upload.array('images', 10)
    const post = await postsService.createPost(req.user.userId, req.body, req.files ?? [])
    res.json({ success: true, data: post })
  } catch (err) {
    next(err)
  }
}

export const toggleLikeHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await postsService.toggleLike(req.user.userId, id)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const toggleSaveHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await postsService.toggleSavePost(req.user.userId, id)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const getSavedPostsHandler = async (req, res, next) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 50)
    const offset = Number.parseInt(req.query.offset, 10) || 0
    const posts = await postsService.getSavedPosts(req.user.userId, limit, offset)
    res.json({ success: true, data: posts })
  } catch (err) {
    next(err)
  }
}
