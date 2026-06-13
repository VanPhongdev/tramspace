import * as homeService from './home.service.js'

export const getHomeHandler = async (req, res, next) => {
  try {
    const homeData = await homeService.getHomeData(req.user.userId)
    res.json({ success: true, data: homeData })
  } catch (err) {
    next(err)
  }
}
