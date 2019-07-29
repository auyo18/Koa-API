import Router from 'koa-router'
import Site from '../db/models/site'
import config from '../../config'
import {verifyToken} from '../utils'

const router = new Router({
  prefix: config.basePrefix + '/site'
})

// 获取网站信息
router.get('/getSiteInfo', async ctx => {
  try {
    const siteResult = await Site.findOne(null, {__v: 0})
    if (siteResult) {
      ctx.body = {
        code: config.SUCCESS_CODE,
        message: '获取网站信息成功',
        data: siteResult
      }
    } else {
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '网站信息为空'
      }
    }
  } catch (e) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: e.message
    }
  }
})

// 设置网站信息
router.post('/setSiteInfo', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return

  const siteInfo = ctx.request.body
  const _id = siteInfo._id
  if (_id) {
    const result = await Site.updateOne({_id}, siteInfo)
    if (result.ok && result.n) {
      ctx.body = {
        code: config.SUCCESS_CODE,
        message: '修改网站信息成功',
        token: verifyResult.token
      }
      return
    }
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: '修改网站信息失败',
      token: verifyResult.token
    }
  } else {
    const siteResult = await Site.findOne()
    if (siteResult) {
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '网站信息ID为空',
        token: verifyResult.token
      }
      return
    }
    try {
      await new Site(siteInfo).save()
      ctx.body = {
        code: config.SUCCESS_CODE,
        message: '网站信息添加成功',
        token: verifyResult.token
      }
    } catch (e) {
      ctx.body = {
        code: config.SYSTEM_ERROR_CODE,
        message: e.message,
        token: verifyResult.token
      }
    }
  }
})

export default router
