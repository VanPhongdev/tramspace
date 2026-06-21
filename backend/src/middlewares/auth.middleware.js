import { verifyAccessToken } from '../utils/jwt.js'

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có access token' })
  }
  try {
    const payload = verifyAccessToken(header.split(' ')[1])
    req.user = payload   // { userId }
    next()
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

export const softAuthenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next()
  }
  try {
    const payload = verifyAccessToken(header.split(' ')[1])
    req.user = payload
  } catch {
    // ignore
  }
  next()
}