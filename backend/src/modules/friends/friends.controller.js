import * as friendsService from './friends.service.js'

// POST /api/friends/request/:id
export const sendRequestHandler = async (req, res, next) => {
  try {
    const result = await friendsService.sendFriendRequest(req.user.userId, req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// DELETE /api/friends/request/:id
export const cancelRequestHandler = async (req, res, next) => {
  try {
    const result = await friendsService.cancelFriendRequest(req.user.userId, req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// POST /api/friends/accept/:id
export const acceptRequestHandler = async (req, res, next) => {
  try {
    const result = await friendsService.acceptFriendRequest(req.user.userId, req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// POST /api/friends/reject/:id
export const rejectRequestHandler = async (req, res, next) => {
  try {
    const result = await friendsService.rejectFriendRequest(req.user.userId, req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// DELETE /api/friends/:id
export const unfriendHandler = async (req, res, next) => {
  try {
    const result = await friendsService.unfriend(req.user.userId, req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// GET /api/friends/user/:id
export const getUserFriendsHandler = async (req, res, next) => {
  try {
    const result = await friendsService.getUserFriends(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}
