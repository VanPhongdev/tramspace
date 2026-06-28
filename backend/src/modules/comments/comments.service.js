import prisma from '../../lib/prisma.js'

const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const COLORS = ['#14b8a6', '#6063ee', '#f38764', '#4648d4', '#005048', '#e11d48', '#0f766e', '#4f46e5']
const getColorFromId = (id) => {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % COLORS.length
  }
  return COLORS[hash]
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

const buildCommentResponse = (comment) => {
  if (comment.isDeleted) {
    return {
      id: comment.id,
      isDeleted: true,
      content: 'Bình luận này đã bị xóa.',
      createdAt: comment.createdAt,
      time: formatRelativeTime(comment.createdAt),
      replyCount: comment.replyCount,
      replies: []
    }
  }

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    time: formatRelativeTime(comment.createdAt),
    likeCount: comment.likeCount ?? 0,
    liked: Array.isArray(comment.likes) && comment.likes.length > 0,
    replyCount: comment.replyCount,
    isDeleted: false,
    author: {
      id: comment.user?.id,
      username: comment.user?.username || null,
      name: comment.user?.displayName || comment.user?.email || 'Người dùng',
      avatarUrl: comment.user?.avatarUrl || null,
      initials: getInitials(comment.user?.displayName || comment.user?.email || 'ND'),
      color: getColorFromId(comment.user?.id || comment.id),
      badge: comment.user?.postsCount > 50 ? 'Người sáng tạo' : null,
      badgeColor: '#6063ee',
    },
    replies: [] // Sẽ được fetch riêng hoặc kèm theo
  }
}

export const getPostComments = async (postId, limit = 10, offset = 0, requesterId = null) => {
  const comments = await prisma.comment.findMany({
    where: { postId, parentCommentId: null },
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
        }
      },
      likes: requesterId ? {
        where: { userId: requesterId },
        select: { userId: true },
      } : false,
    }
  })
  return comments.map(buildCommentResponse)
}

export const getCommentReplies = async (commentId, limit = 10, offset = 0, requesterId = null) => {
  const replies = await prisma.comment.findMany({
    where: { parentCommentId: commentId },
    orderBy: { createdAt: 'asc' }, // Replies thường xếp từ cũ đến mới
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
        }
      },
      likes: requesterId ? {
        where: { userId: requesterId },
        select: { userId: true },
      } : false,
    }
  })
  return replies.map(buildCommentResponse)
}

export const createComment = async (userId, postId, content) => {
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw { status: 404, message: 'Không tìm thấy bài viết' }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        userId,
        postId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
            postsCount: true,
            username: true,
          }
        }
      }
    })

    await tx.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } }
    })

    return created
  })

  return buildCommentResponse(comment)
}

export const createReply = async (userId, commentId, content) => {
  const parent = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!parent) throw { status: 404, message: 'Không tìm thấy bình luận' }

  const reply = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        userId,
        postId: parent.postId,
        parentCommentId: commentId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
            postsCount: true,
            username: true,
          }
        }
      }
    })

    await tx.comment.update({
      where: { id: commentId },
      data: { replyCount: { increment: 1 } }
    })

    await tx.post.update({
      where: { id: parent.postId },
      data: { commentCount: { increment: 1 } }
    })

    return created
  })

  return buildCommentResponse(reply)
}

export const deleteComment = async (userId, commentId) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) throw { status: 404, message: 'Không tìm thấy bình luận' }
  if (comment.userId !== userId) throw { status: 403, message: 'Không có quyền xóa' }

  // Hard delete
  await prisma.comment.delete({
    where: { id: commentId },
  })

  // Nếu là bình luận gốc, giảm commentCount của post
  if (!comment.parentCommentId) {
    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } }
    }).catch(() => {})
  } else {
    // Nếu là reply, giảm replyCount của comment gốc
    await prisma.comment.update({
      where: { id: comment.parentCommentId },
      data: { replyCount: { decrement: 1 } }
    }).catch(() => {})
  }

  return { success: true }
}

export const toggleLikeComment = async (userId, commentId) => {
  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  })

  if (existingLike) {
    // Đã like -> Unlike
    await prisma.$transaction([
      prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      }),
    ])
    return { liked: false }
  } else {
    // Chưa like -> Like
    await prisma.$transaction([
      prisma.commentLike.create({
        data: { userId, commentId },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ])
    return { liked: true }
  }
}
