import prisma from '../../lib/prisma.js'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const COLORS = ['#14b8a6', '#6063ee', '#f38764', '#4648d4', '#005048', '#e11d48', '#0f766e', '#4f46e5']

const uploadImageToCloudinary = async (buffer) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'tramspace/posts', resource_type: 'image' },
      (err, res) => {
        if (err) return reject(new Error(err.message || 'Cloudinary upload failed'))
        resolve(res)
      },
    ).end(buffer)
  })
  return result
}

const buildPostResponse = (post) => ({
  id: post.id,
  author: {
    id: post.user?.id,
    username: post.user?.username || null,
    name: post.user?.displayName || post.user?.email || 'Người dùng',
    avatarUrl: post.user?.avatarUrl || null,
    initials: getInitials(post.user?.displayName || post.user?.email || 'ND'),
    color: getColorFromId(post.user?.id || post.id),
    badge: post.user?.postsCount > 50 ? 'Người sáng tạo' : null,
    badgeColor: '#6063ee',
  },
  time: formatRelativeTime(post.createdAt),
  location: null,
  visibility: post.visibility || 'PUBLIC',
  content: post.content || '',
  hasImage: Array.isArray(post.media) && post.media.length > 0,
  // Mảng URL tất cả ảnh theo thứ tự displayOrder
  images: Array.isArray(post.media)
    ? post.media
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((m) => m.imageUrl)
    : [],
  imageAspect: '16/9',
  imageColor: getColorFromId(post.id),
  liked: Array.isArray(post.likes) && post.likes.length > 0,
  likes: formatCount(post.likeCount ?? 0),
  comments: post.commentCount ?? 0,
  shares: 0,
  saved: Array.isArray(post.savedBy) && post.savedBy.length > 0,
  pinned: false,
})

const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const getColorFromId = (id) => {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.codePointAt(i)) % COLORS.length
  }
  return COLORS[hash]
}

const formatCount = (count) => {
  if (typeof count !== 'number') return '0'
  if (count >= 1000000) return `${Math.floor(count / 1000000)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `${count}`
}

const formatRelativeTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ngày trước`
}

export const getUserPosts = async (userId, limit = 10, offset = 0, requesterId = null) => {
  let followingIds = []
  if (requesterId) {
    const followed = await prisma.follow.findMany({
      where: { followerId: requesterId },
      select: { followingId: true },
    })
    followingIds = followed.map(f => f.followingId)
  }

  const orConditions = [{ visibility: 'PUBLIC' }]
  if (requesterId) {
    orConditions.push({ visibility: 'PRIVATE', userId: requesterId })
    orConditions.push({ visibility: 'FRIENDS', userId: { in: [requesterId, ...followingIds] } })
  }

  const posts = await prisma.post.findMany({
    where: {
      userId,
      isDeleted: false,
      OR: orConditions
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatarUrl: true,
          postsCount: true,
          username: true,
        },
      },
      media: true,
      likes: requesterId ? {
        where: { userId: requesterId },
        select: { userId: true },
      } : false,
      savedBy: requesterId ? {
        where: { userId: requesterId },
        select: { userId: true },
      } : false,
    },
  })

  return posts.map(buildPostResponse)
}

export const getPost = async (postId, requesterId = null) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatarUrl: true,
          postsCount: true,
          username: true,
        },
      },
      media: true,
      likes: requesterId ? {
        where: { userId: requesterId },
        select: { userId: true },
      } : false,
      savedBy: requesterId ? {
        where: { userId: requesterId },
        select: { userId: true },
      } : false,
    },
  })

  if (!post) throw new Error('Không tìm thấy bài viết')

  return buildPostResponse(post)
}

export const createPost = async (userId, { content, visibility = 'PUBLIC' }, files) => {
  // files có thể là mảng (upload.array) hoặc một file hoặc rỗng
  const fileArray = Array.isArray(files) ? files : files ? [files] : []

  const postData = { userId, content, visibility }

  const createData = {
    data: postData,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatarUrl: true,
          postsCount: true,
          username: true,
        },
      },
      media: true,
    },
  }

  if (fileArray.length > 0) {
    // Upload song song tất cả ảnh lên Cloudinary
    const uploadResults = await Promise.all(
      fileArray.map((file) => uploadImageToCloudinary(file.buffer))
    )

    createData.data.media = {
      create: uploadResults.map((result, index) => ({
        imageUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        displayOrder: index,
      })),
    }
  }

  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create(createData)
    // Tăng postsCount của user sau khi tạo bài thành công
    await tx.user.update({
      where: { id: userId },
      data: { postsCount: { increment: 1 } },
    })
    return created
  })
  return buildPostResponse(post)
}

export const toggleLike = async (userId, postId) => {
  const existingLike = await prisma.postLike.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  })

  if (existingLike) {
    // Đã like -> Xoá like (Unlike)
    await prisma.$transaction([
      prisma.postLike.delete({
        where: { userId_postId: { userId, postId } },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ])
    return { liked: false }
  } else {
    // Chưa like -> Thêm like (Like)
    await prisma.$transaction([
      prisma.postLike.create({
        data: { userId, postId },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ])
    return { liked: true }
  }
}

export const updatePost = async (userId, postId, { content, visibility }) => {
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw Object.assign(new Error('Không tìm thấy bài viết'), { status: 404 })
  if (post.userId !== userId) throw Object.assign(new Error('Không có quyền chỉnh sửa bài viết này'), { status: 403 })

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(content !== undefined && { content }),
      ...(visibility !== undefined && { visibility }),
    },
    include: {
      user: {
        select: { id: true, displayName: true, email: true, avatarUrl: true, postsCount: true, username: true },
      },
      media: true,
    },
  })
  return buildPostResponse(updated)
}

export const deletePost = async (userId, postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { media: { select: { cloudinaryPublicId: true } } }
  })
  if (!post) throw Object.assign(new Error('Không tìm thấy bài viết'), { status: 404 })
  if (post.userId !== userId) throw Object.assign(new Error('Không có quyền xóa bài viết này'), { status: 403 })

  // Xóa ảnh trên Cloudinary trước
  if (post.media?.length > 0) {
    await Promise.allSettled(
      post.media.map(m => cloudinary.uploader.destroy(m.cloudinaryPublicId))
    )
  }

  // Hard-delete: xóa hẳn khỏi DB (cascade xóa media, comments, likes, savedPosts)
  await prisma.$transaction([
    prisma.post.delete({ where: { id: postId } }),
    prisma.user.update({
      where: { id: userId },
      data: { postsCount: { decrement: 1 } },
    }),
  ])
  return { deleted: true }
}

export const getSavedPosts = async (userId, limit = 10, offset = 0) => {
  const saved = await prisma.savedPost.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      post: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              avatarUrl: true,
              postsCount: true,
            },
          },
          media: { select: { imageUrl: true, displayOrder: true } },
          likes: { where: { userId }, select: { userId: true } },
          savedBy: { where: { userId }, select: { userId: true } },
        },
      },
    },
  })

  // Filter out any posts that might have been hard-deleted but orphaned the SavedPost
  return saved.map((s) => s.post).filter(Boolean).map(buildPostResponse)
}

export const toggleSavePost = async (userId, postId) => {
  const existing = await prisma.savedPost.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  })

  if (existing) {
    // Already saved -> Unsave
    await prisma.savedPost.delete({
      where: { userId_postId: { userId, postId } },
    })
    return { saved: false }
  } else {
    // Not saved -> Save
    await prisma.savedPost.create({
      data: { userId, postId },
    })
    return { saved: true }
  }
}
