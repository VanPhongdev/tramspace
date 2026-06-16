import * as userService from './user.service.js'

// GET /api/users/me
export const getMeHandler = async (req, res, next) => {
  try {
    // req.user.userId được set bởi authenticate middleware
    const user = await userService.getUserById(req.user.userId)
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

// GET /api/users/:handle — tìm theo UUID hoặc username
export const getProfileHandler = async (req, res, next) => {
  try {
    const user = await userService.getProfileByHandle(req.params.handle)
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

// PATCH /api/users/me
export const updateProfileHandler = async (req, res, next) => {
  try {
    // req.body đã được validate bởi validate(updateProfileSchema)
    const user = await userService.updateProfile(req.user.userId, req.body)
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

// PATCH /api/users/me/username
export const updateUsernameHandler = async (req, res, next) => {
  try {
    const { username } = req.body
    const user = await userService.updateUsername(req.user.userId, username)
    res.json({ success: true, data: user })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
        ...(err.nextAllowedAt ? { nextAllowedAt: err.nextAllowedAt } : {}),
      })
    }
    next(err)
  }
}

// POST /api/users/me/avatar
export const uploadAvatarHandler = async (req, res, next) => {
  try {
    // req.file được set bởi multer middleware
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh' })
    }
    // req.file.buffer là nội dung file dạng binary trong RAM
    const user = await userService.uploadAvatar(req.user.userId, req.file.buffer)
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}