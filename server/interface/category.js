import Router from 'koa-router'
import mongoose from 'mongoose'
import Category from '../db/models/category'
import Article from "../db/models/article"
import config from '../../config'
import {verifyToken} from "../utils"

const ObjectId = mongoose.Types.ObjectId

const router = new Router({
  prefix: config.basePrefix + '/category'
})

// 获取分类
router.get('/getCategory', async ctx => {
  try {
    const result = await Category.find(null, {name: 1, slug: 1, description: 1, thumbnail: 1})
    ctx.body = {
      code: config.SUCCESS_CODE,
      message: '分类获取成功',
      data: result
    }
  } catch (e) {
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: e.message
    }
  }
})

// 添加分类
router.post('/addCategory', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return

  const categoryData = ctx.request.body
  const {name, slug} = categoryData

  if (!name) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类名为空',
      token: verifyResult.token
    }
    return
  }

  if (!slug) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类别名为空',
      token: verifyResult.token
    }
    return
  }

  if (await Category.findOne({name})) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类名已存在',
      token: verifyResult.token
    }
    return
  }

  if (await Category.findOne({slug})) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '别名已存在',
      token: verifyResult.token
    }
    return
  }
  try {
    await new Category(categoryData).save()

    ctx.body = {
      code: config.SUCCESS_CODE,
      message: '分类添加成功',
      token: verifyResult.token
    }
  } catch (e) {
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: e.message
    }
  }
})

//修改分类
router.post('/updateCategory', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return

  const categoryData = ctx.request.body
  const _id = categoryData._id
  const {name, slug} = categoryData
  if (_id) {
    if (!name) {
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '分类名为空',
        token: verifyResult.token
      }
      return
    }
    if (!slug) {
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '分类别名为空',
        token: verifyResult.token
      }
      return
    }

    const hasName = await Category.findOne({name})
    if (hasName) {
      // 分类名已存在的id不是当前id
      if (hasName._id.toString() !== _id) {
        ctx.body = {
          code: config.INFO_ERROR_CODE,
          message: '分类名已存在',
          token: verifyResult.token
        }
        return
      }
    }
    const hasSlug = await Category.findOne({slug})
    if (hasSlug) {
      // 分类别名已存在的id不是当前id
      if (hasSlug._id.toString() !== _id) {
        ctx.body = {
          code: config.INFO_ERROR_CODE,
          message: '别名已存在',
          token: verifyResult.token
        }
        return
      }
    }

    try {
      const result = await Category.updateOne({_id}, categoryData)
      if (result.ok && result.n) {
        ctx.body = {
          code: config.SUCCESS_CODE,
          message: '修改分类成功',
          token: verifyResult.token
        }
      } else {
        ctx.body = {
          code: config.SYSTEM_ERROR_CODE,
          message: '修改分类失败',
          token: verifyResult.token
        }
      }
    } catch (e) {
      ctx.body = {
        code: config.SYSTEM_ERROR_CODE,
        message: e.message,
        token: verifyResult.token
      }
    }
  } else {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类id为空',
      token: verifyResult.token
    }
  }
})

// 删除分类
router.post('/deleteCategory', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return

  const {_id} = ctx.request.body
  if (_id) {
    const totalResult = await Article.aggregate([
      {
        $match: {category_id: ObjectId(_id)}
      }
    ])

    if (totalResult.length) {
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '不能删除存在文章的分类',
        token: verifyResult.token
      }
    } else {
      const result = await Category.deleteOne({_id})
      if (result.ok && result.n) {
        ctx.body = {
          code: config.SUCCESS_CODE,
          message: '删除分类成功',
          token: verifyResult.token
        }
      } else {
        ctx.body = {
          code: config.SYSTEM_ERROR_CODE,
          message: '删除分类失败',
          token: verifyResult.token
        }
      }
    }
  } else {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类ID为空',
      token: verifyResult.token
    }
  }
})

// 检测是否存在分类名
router.get('/hasCategoryName', async ctx => {
  const {name} = ctx.query
  if (name && await Category.findOne({name})) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类名已存在',
      token: verifyResult.token
    }
    return
  }
  ctx.body = {
    code: config.SUCCESS_CODE,
    message: '分类名不存在',
    token: verifyResult.token
  }
})

// 检测是否存在分类别名
router.get('/hasCategorySlug', async ctx => {
  const {slug} = ctx.query
  if (slug && await Category.findOne({slug})) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类别名已存在',
      token: verifyResult.token
    }
    return
  }
  ctx.body = {
    code: config.SUCCESS_CODE,
    message: '分类别名不存在',
    token: verifyResult.token
  }
})

export default router
