import cloudinary from 'cloudinary'
import prisma from '../../lib/prisma.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Tích public_id từ Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null
  try {
    const parts = url.split('/upload/')
    if (parts.length < 2) return null
    const afterUpload = parts[1]
    const withoutVersion = afterUpload.replace(/^v\d+\//, '')
    const withoutExt = withoutVersion.replace(/\.[^/.]+$/, '')
    return withoutExt
  } catch {
    return null
  }
}

const deleteFromCloudinary = async (url) => {
  const publicId = extractPublicId(url)
  if (!publicId) return
  try {
    await cloudinary.v2.uploader.destroy(publicId)
  } catch (err) {
    console.error('[Cloudinary] Failed to delete:', publicId, err.message)
  }
}

// Select chung cho các query trả về user info
const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  usernameUpdatedAt: true,
  displayName: true,
  bio: true,
  hometown: true,
  currentLocation: true,
  occupation: true,
  major: true,
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
export const getProfileByHandle = async (handle, requesterId = null) => {
  const isUuid = UUID_REGEX.test(handle)
  const user = await prisma.user.findUnique({
    where: isUuid ? { id: handle } : { username: handle },
    select: USER_SELECT
  })
  if (!user) throw { status: 404, message: 'Không tìm thấy user' }

  let friendshipStatus = 'NONE'
  let isFollowing = false

  if (requesterId && requesterId !== user.id) {
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: requesterId, receiverId: user.id },
          { senderId: user.id, receiverId: requesterId }
        ]
      }
    })

    if (friendRequest) {
      if (friendRequest.status === 'ACCEPTED') {
        friendshipStatus = 'FRIENDS'
      } else if (friendRequest.status === 'PENDING') {
        friendshipStatus = friendRequest.senderId === requesterId ? 'PENDING_SENT' : 'PENDING_RECEIVED'
      }
    }

    const follow = await prisma.follow.findFirst({
      where: { followerId: requesterId, followingId: user.id }
    })
    isFollowing = !!follow
  }

  return { ...user, friendshipStatus, isFollowing }
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
  // Chỉ cập nhật URL mới, không xóa ảnh cũ (việc xóa ảnh là thao tác riêng biệt)
  return updateProfile(userId, { avatarUrl: result.secure_url })
}

export const uploadCover = async (userId, fileBuffer) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder: 'tramspace/covers', transformation: [{ width: 1920, height: 1080, crop: 'fill' }] },
      (err, res) => err ? reject(err) : resolve(res)
    ).end(fileBuffer)
  })
  // Chỉ cập nhật URL mới, không xóa ảnh cũ (việc xóa ảnh là thao tác riêng biệt)
  return updateProfile(userId, { coverUrl: result.secure_url })
}

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) throw { status: 400, message: 'Không thể tự theo dõi' }

  const target = await prisma.user.findUnique({ where: { id: followingId } })
  if (!target) throw { status: 404, message: 'Người dùng không tồn tại' }

  try {
    await prisma.follow.create({
      data: { followerId, followingId }
    })

    await prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } }
    })

    await prisma.user.update({
      where: { id: followingId },
      data: { followersCount: { increment: 1 } }
    })

    return { success: true }
  } catch (error) {
    if (error.code === 'P2002') return { success: true } // Already following
    throw error
  }
}

export const unfollowUser = async (followerId, followingId) => {
  const follow = await prisma.follow.findFirst({
    where: { followerId, followingId }
  })

  if (follow) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } }
    })

    await prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } }
    })

    await prisma.user.update({
      where: { id: followingId },
      data: { followersCount: { decrement: 1 } }
    })
  }

  return { success: true }
}
