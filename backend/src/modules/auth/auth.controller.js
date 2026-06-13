import * as authService from './auth.service.js'
import * as userService from '../user/user.service.js'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

export const registerHandler = async (req, res, next) => {
  try {
    const { email, password, displayName, gender, dateOfBirth } = req.body
    const user = await authService.register({ email, password, displayName, gender, dateOfBirth })
    res.status(201).json({ success: true, data: user })
  } catch (err) { next(err) }
}

export const loginHandler = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    res.json({ success: true, data: { accessToken, user } })
  } catch (err) { next(err) }
}

export const refreshHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ message: 'Không có refresh token' })
    const { accessToken } = await authService.refresh(token)
    res.json({ success: true, data: { accessToken } })
  } catch (err) { next(err) }
}

export const logoutHandler = async (req, res, next) => {
  try {
    await authService.logout(req.user.userId)
    res.clearCookie('refreshToken')
    res.json({ success: true })
  } catch (err) { next(err) }
}

// GET /api/auth/me — trả về thông tin user hiện tại (yêu cầu authenticate middleware)
export const meHandler = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.userId)
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}