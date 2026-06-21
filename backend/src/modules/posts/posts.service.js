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
    name: post.user?.displayName || post.user?.email || 'Người dùng',
    avatarUrl: post.user?.avatarUrl || null,
    initials: getInitials(post.user?.displayName || post.user?.email || 'ND'),
    color: getColorFromId(post.user?.id || post.id),
    badge: post.user?.postsCount > 50 ? 'Người sáng tạo' : null,
    badgeColor: '#6063ee',
  },
  time: formatRelativeTime(post.createdAt),
  location: null,
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
  liked: false,
  likes: formatCount(post.likeCount ?? 0),
  comments: post.commentCount ?? 0,
  shares: 0,
  saved: false,
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

export const getUserPosts = async (userId, limit = 10, offset = 0) => {
  const posts = await prisma.post.findMany({
    where: { userId },
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
        },
      },
      media: true,
    },
  })

  return posts.map(buildPostResponse)
}

export const getPost = async (postId) => {
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
        },
      },
      media: true,
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
