import cloudinary from 'cloudinary'
import prisma from '../../lib/prisma.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Select chung cho các query trả về user info
const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  usernameUpdatedAt: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  coverUrl: true,
  gender: true,
  dateOfBirth: true,
  followersCount: true,
  followingCount: true,
  postsCount: true,
  createdAt: true,
}

// UUID regex — dùng để phân biệt handle là UUID hay username
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/users/me — lấy thông tin người dùng hiện tại theo id
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT
  })
  if (!user) throw { status: 404, message: 'Không tìm thấy user' }
  return user
}

// GET /api/users/:handle — tìm theo UUID hoặc username
export const getProfileByHandle = async (handle) => {
  const isUuid = UUID_REGEX.test(handle)
  const user = await prisma.user.findUnique({
    where: isUuid ? { id: handle } : { username: handle },
    select: USER_SELECT
  })
  if (!user) throw { status: 404, message: 'Không tìm thấy user' }
  return user
}

export const updateProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: USER_SELECT
  })
}

// PATCH /api/users/me/username — đặt/đổi username, giới hạn 1 lần/tuần
export const updateUsername = async (userId, newUsername) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { usernameUpdatedAt: true }
  })
  if (!user) throw { status: 404, message: 'Không tìm thấy user' }

  // Kiểm tra cooldown 7 ngày
  if (user.usernameUpdatedAt) {
    const daysSince = (Date.now() - new Date(user.usernameUpdatedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < 7) {
      const nextAllowed = new Date(user.usernameUpdatedAt)
      nextAllowed.setDate(nextAllowed.getDate() + 7)
      throw {
        status: 429,
        message: `Bạn chỉ có thể đổi username 1 lần mỗi tuần. Có thể đổi lại vào ${nextAllowed.toLocaleDateString('vi-VN')}.`,
        nextAllowedAt: nextAllowed.toISOString(),
      }
    }
  }

  // Kiểm tra username đã tồn tại chưa
  const existing = await prisma.user.findUnique({
    where: { username: newUsername },
    select: { id: true }
  })
  if (existing && existing.id !== userId) {
    throw { status: 409, message: 'Username này đã được sử dụng, vui lòng chọn tên khác.' }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      username: newUsername,
      usernameUpdatedAt: new Date(),
    },
    select: USER_SELECT
  })
}

export const uploadAvatar = async (userId, fileBuffer) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder: 'tramspace/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
      (err, res) => err ? reject(err) : resolve(res)
    ).end(fileBuffer)
  })
  // Lưu cloudinary_public_id để có thể xóa ảnh cũ sau này
  return updateProfile(userId, {
    avatarUrl: result.secure_url,
  })
}