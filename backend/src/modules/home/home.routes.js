import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { getHomeHandler } from './home.controller.js'

const router = Router()

router.get('/', authenticate, getHomeHandler)

export default router
