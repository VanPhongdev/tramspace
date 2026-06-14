import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware.js'
import upload from '../../middlewares/upload.middleware.js'
import {
  getUserPostsHandler,
  getPostHandler,
  createPostHandler,
} from './posts.controller.js'

const router = Router()

router.get('/users/:id/posts', getUserPostsHandler)

router.get('/:id', getPostHandler)

router.post('/', authenticate, upload.array('images', 10), createPostHandler)

export default router
