import { Router } from 'express'
import { authenticate, softAuthenticate } from '../../middlewares/auth.middleware.js'
import upload from '../../middlewares/upload.middleware.js'
import {
  getUserPostsHandler,
  getPostHandler,
  createPostHandler,
  toggleLikeHandler,
  toggleSaveHandler,
  getSavedPostsHandler,
  updatePostHandler,
  deletePostHandler,
} from './posts.controller.js'

const router = Router()

router.get('/users/:id/posts', softAuthenticate, getUserPostsHandler)

router.get('/saved', authenticate, getSavedPostsHandler)

router.get('/:id', getPostHandler)

router.post('/', authenticate, upload.array('images', 10), createPostHandler)

router.post('/:id/like', authenticate, toggleLikeHandler)

router.post('/:id/save', authenticate, toggleSaveHandler)

router.patch('/:id', authenticate, updatePostHandler)

router.delete('/:id', authenticate, deletePostHandler)

export default router
