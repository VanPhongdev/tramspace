import * as postsService from './posts.service.js'

export const getUserPostsHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 100)
    const offset = Number.parseInt(req.query.offset, 10) || 0

    const posts = await postsService.getUserPosts(id, limit, offset)
    res.json({ success: true, data: posts })
  } catch (err) {
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
