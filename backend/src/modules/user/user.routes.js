import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { updateProfileSchema, updateUsernameSchema } from '../auth/auth.schema.js'
import upload from '../../middlewares/upload.middleware.js'
import {
  getProfileHandler,
  updateProfileHandler,
  uploadAvatarHandler,
  getMeHandler,
  updateUsernameHandler,
} from './user.controller.js'

const router = Router()

// GET /api/users/me — lấy thông tin chính mình (cần auth)
// Phải đặt TRƯỚC /:handle vì Express match từ trên xuống
router.get('/me', authenticate, getMeHandler)

// GET /api/users/:handle — xem profile theo UUID hoặc username (không cần auth)
router.get('/:handle', getProfileHandler)

// PATCH /api/users/me — cập nhật profile (cần auth + validate)
router.patch('/me', authenticate, validate(updateProfileSchema), updateProfileHandler)

// PATCH /api/users/me/username — đặt/đổi username (giới hạn 1 lần/tuần)
router.patch('/me/username', authenticate, validate(updateUsernameSchema), updateUsernameHandler)

// POST /api/users/me/avatar — upload ảnh đại diện
// upload.single('avatar') là multer middleware — nhận file từ form-data field 'avatar'
router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatarHandler)

export default router