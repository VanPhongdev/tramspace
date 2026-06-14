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

const normalizeUsername = (displayName, email) => {
  if (displayName) {
    return `@${displayName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')}`
  }
  return `@${email.split('@')[0]}`
}

export const getHomeData = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      followersCount: true,
      followingCount: true,
      postsCount: true,
    }
  })

  if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' }

  const currentUser = {
    id: user.id,
    name: user.displayName || user.email,
    username: normalizeUsername(user.displayName, user.email),
    initials: getInitials(user.displayName || user.email),
    avatarColor: getColorFromId(user.id),
    following: formatCount(user.followingCount ?? 0),
    followers: formatCount(user.followersCount ?? 0),
  }

  const feedPostsRaw = await prisma.post.findMany({
    where: { visibility: 'PUBLIC', isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 12,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          postsCount: true,
        },
      },
      media: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  const feedPosts = feedPostsRaw.map((post) => ({
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
    images: post.media.map((m) => m.imageUrl),
    imageAspect: '16/9',
    imageColor: getColorFromId(post.id),
    liked: false,
    likes: formatCount(post.likeCount ?? 0),
    comments: post.commentCount ?? 0,
    shares: 0,
    saved: false,
  }))

  const storiesRaw = await prisma.user.findMany({
    where: { id: { not: userId } },
    orderBy: { updatedAt: 'desc' },
    take: 8,
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  })

  const stories = storiesRaw.map((story) => ({
    id: story.id,
    name: story.displayName || story.email,
    initials: getInitials(story.displayName || story.email),
    color: getColorFromId(story.id),
  }))

  const followed = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const followingIds = followed.map((item) => item.followingId)

  const suggestionsRaw = await prisma.user.findMany({
    where: { id: { notIn: [userId, ...followingIds] } },
    orderBy: { followersCount: 'desc' },
    take: 4,
    select: {
      id: true,
      displayName: true,
      email: true,
      followersCount: true,
    },
  })

  const suggestions = suggestionsRaw.map((suggestion) => ({
    id: suggestion.id,
    name: suggestion.displayName || suggestion.email,
    initials: getInitials(suggestion.displayName || suggestion.email),
    color: getColorFromId(suggestion.id),
    reason: `Có ${formatCount(suggestion.followersCount)} người theo dõi`,
  }))

  const onlineFriendsRaw = await prisma.user.findMany({
    where: { id: { in: followingIds } },
    take: 5,
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  })

  const onlineFriends = onlineFriendsRaw.map((friend) => ({
    id: friend.id,
    name: friend.displayName || friend.email,
    initials: getInitials(friend.displayName || friend.email),
    color: getColorFromId(friend.id),
  }))

  const hashtagCounts = {}
  for (const post of feedPostsRaw) {
    const matches = String(post.content || '').match(/#\w+/g)
    if (!matches) continue
    for (const tag of matches) {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1
    }
  }

  const trendingTopics = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count], index) => ({
      id: `t${index + 1}`,
      category: 'Xu hướng',
      tag,
      posts: `${count} bài đăng`,
    }))

  return {
    currentUser,
    stories,
    feedPosts,
    trendingTopics,
    suggestions,
    onlineFriends,
  }
}
