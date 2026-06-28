import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware.js'
import {
  sendRequestHandler,
  cancelRequestHandler,
  acceptRequestHandler,
  rejectRequestHandler,
  unfriendHandler,
  getUserFriendsHandler
} from './friends.controller.js'

const router = Router()

// GET /api/friends/user/:id — công khai, không cần auth
router.get('/user/:id', getUserFriendsHandler)

// Các endpoints sau đây cần auth
router.use(authenticate)
router.post('/request/:id', sendRequestHandler)
router.delete('/request/:id', cancelRequestHandler)
router.post('/accept/:id', acceptRequestHandler)
router.post('/reject/:id', rejectRequestHandler)
router.delete('/:id', unfriendHandler)

export default router
