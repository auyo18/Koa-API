import mongoose from 'mongoose'
import Router from 'koa-router'
import Article from '../db/models/article'
import config from '../../config'
import {verifyToken} from '../utils'

const ObjectId = mongoose.Types.ObjectId

const router = new Router({
  prefix: config.basePrefix + '/article'
})

// 获取文章列表
router.get('/getArticleList', async ctx => {
  let {page = 1, limit = 10, sort = -1, importance, category_id, sortName = 'updateTime', keyword, search} = ctx.query
  if (limit > 10) {
    limit = 10
  }
  let $match = {}
  if (importance) {
    $match.importance = parseInt(importance)
  }
  if (category_id) {
    $match.category_id = ObjectId(category_id)
  }
  if (keyword) {
    $match.keyword = {$regex: keyword}
  }
  if (search) {
    $match.$or = [
      {title: {$regex: search}}, {content: {$regex: search}}, {keyword: {$regex: search}}
    ]
  }

  let total
  const totalResult = await Article.aggregate([
    {
      $match
    },
    {
      $group: {_id: null, total: {$sum: 1}}
    }
  ])
  if (totalResult.length) {
    total = totalResult[0].total
  }

  const article = await Article.aggregate([
    {
      $match
    },
    {
      $lookup: {
        from: 'category',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category'
      },
    },
    {
      $project: {
        count: 1,
        title: 1,
        author: 1,
        thumbnail: 1,
        description: 1,
        keyword: 1,
        importance: 1,
        updateTime: 1,
        category: {
          _id: 1, name: 1, slug: 1, description: 1, thumbnail: 1
        }
      }
    },
    {
      $unwind: {path: '$category', preserveNullAndEmptyArrays: true}
    },
    {
      $sort: {[sortName]: parseInt(sort)}
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: parseInt(limit)
    }
  ])
  if (article.length) {
    ctx.body = {
      code: config.SUCCESS_CODE,
      message: '文章列表获取成功',
      count: article.length,
      total,
      data: article
    }
    return
  }
  ctx.body = {
    code: config.INFO_ERROR_CODE,
    message: '文章列表为空',
    count: 0,
    total: 0
  }
})

// 获取文章详情
router.get('/getDetail', async ctx => {
  const {id} = ctx.query
  if (id) {
    try {
      const detail = await Article.aggregate([
        {
          $match: {_id: ObjectId(id)}
        },
        {
          $lookup: {
            from: 'category',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          },
        },
        {
          $unwind: {path: '$category', preserveNullAndEmptyArrays: true}
        },
        {
          $project: {
            title: 1,
            content: 1,
            author: 1,
            thumbnail: 1,
            description: 1,
            keyword: 1,
            importance: 1,
            updateTime: 1,
            category: {
              _id: 1, name: 1, slug: 1, description: 1, thumbnail: 1
            }
          }
        }
      ])
      if (detail.length) {
        ctx.body = {
          code: config.SUCCESS_CODE,
          message: '文章详情获取成功',
          data: detail
        }
        return
      }
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '文章详情获取失败，ID不正确'
      }
    } catch (e) {
      ctx.body = {
        code: config.SYSTEM_ERROR_CODE,
        message: e.message
      }
    }
  } else {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '文章ID为空'
    }
  }
})

// 获取随机文章
router.get('/getRandomArticle', async ctx => {
  let {limit = 10} = ctx.query
  limit = parseInt(limit)
  if (typeof limit !== 'number') {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: 'limit参数必须是数字'
    }
    return
  }
  if (limit > 10) {
    limit = 10
  }
  try {
    const list = await Article.aggregate([
      {
        $sample: {size: limit}
      },
      {
        $project: {
          title: 1,
          author: 1,
          thumbnail: 1,
          description: 1,
          updateTime: 1
        }
      }
    ])
    if (list.length) {
      ctx.body = {
        code: config.SUCCESS_CODE,
        message: '获取随机文章成功',
        count: list.length,
        data: list
      }
      return
    }
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '随机文章为空',
      count: 0
    }
  } catch (e) {
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: e.message
    }
  }
})

// 添加文章
router.post('/addArticle', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return

  const {title, content, category_id, author, thumbnail, description, keyword, importance = 1} = ctx.request.body

  if (!category_id) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '分类为空',
      token: verifyResult.token
    }
    return
  }

  if (!title) {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '标题为空',
      token: verifyResult.token
    }
    return
  } else {
    if (await Article.findOne({title})) {
      ctx.body = {
        code: config.INFO_ERROR_CODE,
        message: '标题已存在',
        token: verifyResult.token
      }
      return
    }
  }

  try {
    await new Article({title, content, category_id, author, thumbnail, description, keyword, importance}).save()
    ctx.body = {
      code: config.SUCCESS_CODE,
      message: '文章添加成功',
      token: verifyResult.token
    }
  } catch (e) {
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: e.message,
      token: verifyResult.token
    }
  }
})

// 修改文章
router.post('/updateArticle', async ctx => {
  const articleData = ctx.request.body
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return
  const _id = articleData.id
  if (_id) {
    const result = await Article.updateOne({_id}, articleData)
    if (result.ok) {
      ctx.body = {
        code: config.SUCCESS_CODE,
        message: '修改文章成功',
        token: verifyResult.token
      }
      return
    }
    ctx.body = {
      code: config.SYSTEM_ERROR_CODE,
      message: '修改文章失败',
      token: verifyResult.token
    }
  } else {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '文章ID为空',
      token: verifyResult.token
    }
  }
})

// 删除文章
router.post('/deleteArticle', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return
  const {id} = ctx.request.body
  if (id) {
    const result = await Article.deleteOne({_id: id})
    if (result.ok) {
      ctx.body = {
        code: config.SUCCESS_CODE,
        message: '删除文章成功',
        token: verifyResult.token
      }
    } else {
      ctx.body = {
        code: config.SYSTEM_ERROR_CODE,
        message: '删除文章失败',
        token: verifyResult.token
      }
    }
  } else {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '文章ID为空',
      token: verifyResult.token
    }
  }
})

//  批量删除文章
router.post('/deleteArticleList', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return
  const {list} = ctx.request.body
  if (list.length) {
    const result = await Article.deleteMany({_id: {$in: list}})
    if (result.ok) {
      ctx.body = {
        code: config.SUCCESS_CODE,
        message: '批量删除文章成功',
        token: verifyResult.token
      }
    } else {
      ctx.body = {
        code: config.SYSTEM_ERROR_CODE,
        message: '批量删除文章失败',
        token: verifyResult.token
      }
    }
  } else {
    ctx.body = {
      code: config.INFO_ERROR_CODE,
      message: '提交删除列表为空',
      token: verifyResult.token
    }
  }
})

export default router
