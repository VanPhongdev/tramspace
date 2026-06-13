import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware.js'
import {
  getUserPostsHandler,
  getPostHandler,
  createPostHandler,
} from './posts.controller.js'

const router = Router()

// GET /api/posts/:id - get single post
router.get('/:id', getPostHandler)

// GET /api/posts/users/:userId/posts - get user's posts
router.get('/users/:id/posts', getUserPostsHandler)

// POST /api/posts - create post (requires auth)
router.post('/', authenticate, createPostHandler)

export default router
