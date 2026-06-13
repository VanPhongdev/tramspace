import { Router } from 'express'
import { registerHandler, loginHandler, refreshHandler, logoutHandler, meHandler } from './auth.controller.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { registerSchema, loginSchema } from './auth.schema.js'
import { authenticate } from '../../middlewares/auth.middleware.js'

const router = Router()

// validate(schema) là middleware chạy TRƯỚC handler
// Nếu request body không hợp lệ → trả lỗi 400 ngay, không chạy vào controller
router.post('/register', validate(registerSchema), registerHandler)
router.post('/login',    validate(loginSchema),    loginHandler)
router.post('/refresh',  refreshHandler)

// logout cần authenticate trước — phải biết userId để xóa RT trong Redis
router.post('/logout', authenticate, logoutHandler)

// GET /api/auth/me — trả về user hiện tại
router.get('/me', authenticate, meHandler)

export default router