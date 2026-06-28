import prisma from '../../lib/prisma.js'

export const sendFriendRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) throw { status: 400, message: 'Không thể tự kết bạn' }
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
  if (!receiver) throw { status: 404, message: 'Người dùng không tồn tại' }

  // Kiểm tra xem đã có request nào chưa
  const existingReq = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }
  })

  if (existingReq) {
    if (existingReq.status === 'ACCEPTED') throw { status: 400, message: 'Đã là bạn bè' }
    if (existingReq.status === 'PENDING') throw { status: 400, message: 'Đã có lời mời kết bạn' }
    // Nếu REJECTED thì có thể cho phép gửi lại (cập nhật status thành PENDING)
    if (existingReq.status === 'REJECTED') {
      return prisma.friendRequest.update({
        where: { id: existingReq.id },
        data: { status: 'PENDING', senderId, receiverId, createdAt: new Date() }
      })
    }
  }

  return prisma.friendRequest.create({
    data: { senderId, receiverId, status: 'PENDING' }
  })
}

export const cancelFriendRequest = async (senderId, receiverId) => {
  const req = await prisma.friendRequest.findFirst({
    where: { senderId, receiverId, status: 'PENDING' }
  })
  if (!req) throw { status: 400, message: 'Không tìm thấy lời mời kết bạn' }

  return prisma.friendRequest.delete({ where: { id: req.id } })
}

export const acceptFriendRequest = async (receiverId, senderId) => {
  const req = await prisma.friendRequest.findFirst({
    where: { senderId, receiverId, status: 'PENDING' }
  })
  if (!req) throw { status: 400, message: 'Không tìm thấy lời mời kết bạn' }

  // Update status to ACCEPTED
  await prisma.friendRequest.update({
    where: { id: req.id },
    data: { status: 'ACCEPTED' }
  })

  // Mutual Follow (only create if not exists)
  const existingFollowA = await prisma.follow.findFirst({ where: { followerId: senderId, followingId: receiverId } });
  const existingFollowB = await prisma.follow.findFirst({ where: { followerId: receiverId, followingId: senderId } });

  await prisma.follow.createMany({
    data: [
      { followerId: senderId, followingId: receiverId },
      { followerId: receiverId, followingId: senderId }
    ],
    skipDuplicates: true
  })

  // Increment friends count
  await prisma.user.updateMany({
    where: { id: { in: [senderId, receiverId] } },
    data: { friendsCount: { increment: 1 } }
  })

  // Increment following/followers only if they didn't follow each other before
  if (!existingFollowA) {
    await prisma.user.update({ where: { id: senderId }, data: { followingCount: { increment: 1 } } });
    await prisma.user.update({ where: { id: receiverId }, data: { followersCount: { increment: 1 } } });
  }
  if (!existingFollowB) {
    await prisma.user.update({ where: { id: receiverId }, data: { followingCount: { increment: 1 } } });
    await prisma.user.update({ where: { id: senderId }, data: { followersCount: { increment: 1 } } });
  }

  return { success: true }
}

export const rejectFriendRequest = async (receiverId, senderId) => {
  const req = await prisma.friendRequest.findFirst({
    where: { senderId, receiverId, status: 'PENDING' }
  })
  if (!req) throw { status: 400, message: 'Không tìm thấy lời mời kết bạn' }

  return prisma.friendRequest.update({
    where: { id: req.id },
    data: { status: 'REJECTED' }
  })
}

export const unfriend = async (userId1, userId2) => {
  const req = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2, status: 'ACCEPTED' },
        { senderId: userId2, receiverId: userId1, status: 'ACCEPTED' }
      ]
    }
  })
  if (!req) throw { status: 400, message: 'Hai người chưa là bạn bè' }

  // Delete FriendRequest
  await prisma.friendRequest.delete({ where: { id: req.id } })

  // Decrement friends count
  await prisma.user.updateMany({
    where: { id: { in: [userId1, userId2] } },
    data: { friendsCount: { decrement: 1 } }
  })

  // Check existing follows
  const followA = await prisma.follow.findFirst({ where: { followerId: userId1, followingId: userId2 } });
  const followB = await prisma.follow.findFirst({ where: { followerId: userId2, followingId: userId1 } });

  // Remove mutual follow
  await prisma.follow.deleteMany({
    where: {
      OR: [
        { followerId: userId1, followingId: userId2 },
        { followerId: userId2, followingId: userId1 }
      ]
    }
  })

  // Decrement precisely
  if (followA) {
    await prisma.user.update({ where: { id: userId1 }, data: { followingCount: { decrement: 1 } } });
    await prisma.user.update({ where: { id: userId2 }, data: { followersCount: { decrement: 1 } } });
  }
  if (followB) {
    await prisma.user.update({ where: { id: userId2 }, data: { followingCount: { decrement: 1 } } });
    await prisma.user.update({ where: { id: userId1 }, data: { followersCount: { decrement: 1 } } });
  }

  return { success: true }
}

export const getUserFriends = async (userId) => {
  const requests = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ],
      status: 'ACCEPTED'
    },
    include: {
      sender: {
        select: { id: true, displayName: true, email: true, avatarUrl: true, username: true }
      },
      receiver: {
        select: { id: true, displayName: true, email: true, avatarUrl: true, username: true }
      }
    }
  })

  return requests.map(req => {
    const friend = req.senderId === userId ? req.receiver : req.sender
    return {
      id: friend.id,
      name: friend.displayName || friend.email || 'Người dùng',
      username: friend.username || null,
      avatarUrl: friend.avatarUrl || null,
    }
  })
}
