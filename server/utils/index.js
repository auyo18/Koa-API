import jwt from 'jsonwebtoken'
import config from '../../config'

export function verifyToken(ctx, token) {
  token = token || ctx.request.header.token
  let userInfo = {}, permission = true
  if (!token) {
    ctx.body = {
      code: 50008,
      message: '没有权限'
    }
    return false
  }
  jwt.verify(token, config.secret, (err, data) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        ctx.body = {
          code: 50014,
          message: '登录状态过期'
        }
        permission = false
      } else {
        ctx.body = {
          code: 50008,
          message: '没有权限'
        }
        permission = false
      }
      return
    }
    userInfo = data
    // TOKEN 有效期小于1小时重新签发
    if (userInfo.exp - Math.round(new Date().getTime() / 1000) < 3600) {
      userInfo = {
        username: userInfo.username,
        roles: userInfo.roles,
        introduction: userInfo.introduction,
        avatar: userInfo.avatar,
        isEnable: userInfo.isEnable,
        loginCount: userInfo.loginCount,
        loginTime: userInfo.loginTime
      }

      userInfo.token = jwt.sign(userInfo, config.secret, {expiresIn: '3h'}) // 签发 token
    }
  })

  return permission ? userInfo : permission
}
