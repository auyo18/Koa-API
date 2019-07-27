import Router from 'koa-router'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../db/models/user'
import config from '../../config'
import {verifyToken} from "../utils"

const router = new Router({
  prefix: config.basePrefix + '/user'
})

// 用户注册
router.post('/register', async ctx => {
  const userData = ctx.request.body
  let message
  if (!userData.username) {
    message = '用户名为空'
  } else if (!userData.password) {
    message = '密码为空'
  } else if (!userData.roles) {
    message = '用户角色为空'
  } else if (!userData.introduction) {
    message = '用户介绍为空'
  }

  if (message) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message
    }
    return
  }

  if (await User.findOne({username: userData.username})) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '用户名已注册'
    }
    return
  }

  try {
    await new User(userData).save()
    ctx.body = {
      code: config.SUCCESS_CODE,
      message: '用户注册成功'
    }
  } catch (e) {
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: e.message
    }
  }
})

// 用户登录
router.post('/login', async ctx => {
  const {username, password} = ctx.request.body
  if (!username) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '用户名为空'
    }
    return
  }
  if (!password) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '密码为空'
    }
    return
  }
  try {
    const result = await User.findOne({username})
    if (result) {
      const compareResult = await bcrypt.compare(password, result.password)
      if (compareResult) {
        await User.updateOne({username}, {loginCount: (result.loginCount || 0) + 1})

        const userInfo = {
          username: result.username,
          roles: result.roles,
          introduction: result.introduction,
          avatar: result.avatar,
          isEnable: result.isEnable,
          loginCount: result.loginCount,
          loginTime: result.loginTime
        }
        userInfo.token = jwt.sign(userInfo, config.secret, {expiresIn: '3h'}) // 签发 token

        ctx.body = {
          code: config.SUCCESS_CODE,
          message: '登录成功',
          data: userInfo
        }
      } else {
        ctx.body = {
          code: config.INFO_ERROR_CODE,
          message: '密码错误'
        }
      }
    } else {
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '用户不存在'
      }
    }
  } catch (e) {
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: e.message
    }
  }
})

// 用户登录状态
router.post('/isLoggedIn', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return
  ctx.body = {
    code: 0,
    message: 'ok',
    data: verifyResult
  }
})

export default router
