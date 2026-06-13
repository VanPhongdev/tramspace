import prisma from '../../lib/prisma.js'

const COLORS = ['#14b8a6', '#6063ee', '#f38764', '#4648d4', '#005048', '#e11d48', '#0f766e', '#4f46e5']

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
    hash = (hash * 31 + id.charCodeAt(i)) % COLORS.length
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
          postsCount: true,
        },
      },
      media: true,
    },
  })

  return posts.map((post) => ({
    id: post.id,
    author: {
      name: post.user?.displayName || post.user?.email || 'Người dùng',
      initials: getInitials(post.user?.displayName || post.user?.email || 'ND'),
      color: getColorFromId(post.user?.id || post.id),
      badge: post.user?.postsCount > 50 ? 'Người sáng tạo' : null,
      badgeColor: '#6063ee',
    },
    time: formatRelativeTime(post.createdAt),
    location: null,
    content: post.content || '',
    hasImage: Array.isArray(post.media) && post.media.length > 0,
    imageAspect: '16/9',
    imageColor: getColorFromId(post.id),
    liked: false,
    likes: formatCount(post.likeCount ?? 0),
    comments: post.commentsCount ?? 0,
    shares: 0,
    saved: false,
    pinned: false,
  }))
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
          postsCount: true,
        },
      },
      media: true,
    },
  })

  if (!post) throw { status: 404, message: 'Không tìm thấy bài viết' }

  return {
    id: post.id,
    author: {
      name: post.user?.displayName || post.user?.email || 'Người dùng',
      initials: getInitials(post.user?.displayName || post.user?.email || 'ND'),
      color: getColorFromId(post.user?.id || post.id),
      badge: post.user?.postsCount > 50 ? 'Người sáng tạo' : null,
      badgeColor: '#6063ee',
    },
    time: formatRelativeTime(post.createdAt),
    location: null,
    content: post.content || '',
    hasImage: Array.isArray(post.media) && post.media.length > 0,
    imageAspect: '16/9',
    imageColor: getColorFromId(post.id),
    liked: false,
    likes: formatCount(post.likeCount ?? 0),
    comments: post.commentsCount ?? 0,
    shares: 0,
    saved: false,
    pinned: false,
  }
}

export const createPost = async (userId, { content, visibility = 'PUBLIC' }) => {
  const post = await prisma.post.create({
    data: {
      userId,
      content,
      visibility,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          postsCount: true,
        },
      },
      media: true,
    },
  })

  return {
    id: post.id,
    author: {
      name: post.user?.displayName || post.user?.email || 'Người dùng',
      initials: getInitials(post.user?.displayName || post.user?.email || 'ND'),
      color: getColorFromId(post.user?.id || post.id),
      badge: post.user?.postsCount > 50 ? 'Người sáng tạo' : null,
      badgeColor: '#6063ee',
    },
    time: formatRelativeTime(post.createdAt),
    location: null,
    content: post.content || '',
    hasImage: Array.isArray(post.media) && post.media.length > 0,
    imageAspect: '16/9',
    imageColor: getColorFromId(post.id),
    liked: false,
    likes: formatCount(post.likeCount ?? 0),
    comments: post.commentsCount ?? 0,
    shares: 0,
    saved: false,
    pinned: false,
  }
}
