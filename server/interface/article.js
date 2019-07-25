import mongoose from 'mongoose'
import Router from 'koa-router'
import Article from '../db/models/article'

const ObjectId = mongoose.Types.ObjectId

const router = new Router({
  prefix: '/article'
})

router.get('/getArticleList', async ctx => {
  const {page = 1, limit = 10, sort = -1, importance, category_id, sortName = 'updateTime', keyword, search} = ctx.query
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
      {
        title: {$regex: search}
      },
      {
        content: {$regex: search}
      },
      {
        keyword: {$regex: search}
      }
    ]
  }

  const article = await Article.aggregate([
    {
      $match
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category'
      },
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
    },
    {
      $sort: {[sortName]: parseInt(sort)}
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: limit
    }
  ])

  ctx.body = {
    code: 0,
    message: 'success',
    data: article
  }
})

// 添加文章
router.post('/addArticle', async ctx => {
  const {title, content, category_id, author, thumbnail, description, keyword, importance = 1} = ctx.request.body

  if (!category_id) {
    ctx.body = {
      code: -1,
      message: '分类为空'
    }
    return
  }

  if (!title) {
    ctx.body = {
      code: -1,
      message: '标题为空'
    }
    return
  } else {
    if (await Article.findOne({title})) {
      ctx.body = {
        code: -1,
        message: '标题已存在'
      }
      return
    }
  }

  try {
    await new Article({title, content, category_id, author, thumbnail, description, keyword, importance}).save()
    ctx.body = {
      code: 0,
      message: '文章添加成功'
    }
  } catch (e) {
    ctx.body = {
      code: 1,
      message: e.message
    }
  }
})

router.get('/detail', async ctx => {
  const detail = await Article.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category'
      },
    },
    {
      $project: {
        title: 1, content: 1, updateTime: 1, category: {
          _id: 1, name: 1, slug: 1, description: 1, thumbnail: 1
        }
      }
    },
    {
      $sort: {
        updateTime: -1
      }
    }
  ])

  ctx.body = {
    code: 0,
    message: 'success',
    data: detail
  }
})

export default router
