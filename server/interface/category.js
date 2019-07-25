import Router from 'koa-router'
import Category from '../db/models/category'

const router = new Router({
  prefix: '/category'
})

// 获取分类
router.get('/getCategory', async ctx => {
  try {
    const result = await Category.find(null, {name: 1, slug: 1, description: 1, thumbnail: 1})
    ctx.body = {
      code: 0,
      message: '分类获取成功',
      data: result
    }
  } catch (e) {
    ctx.body = {
      code: 1,
      message: e.message
    }
  }
})

// 添加分类
router.post('/addCategory', async ctx => {
  const {name, slug, description, thumbnail} = ctx.request.body

  if (!name) {
    ctx.body = {
      code: -1,
      message: '分类名为空'
    }
    return
  }

  if (!slug) {
    ctx.body = {
      code: -1,
      message: '分类别名为空'
    }
    return
  }

  if (await Category.findOne({name})) {
    ctx.body = {
      code: -1,
      message: '分类名已存在'
    }
    return
  }

  if (await Category.findOne({slug})) {
    ctx.body = {
      code: -1,
      message: '别名已存在'
    }
    return
  }
  try {
    await new Category({name, slug, description, thumbnail}).save()

    ctx.body = {
      code: 0,
      message: '分类添加成功'
    }
  } catch (e) {
    ctx.body = {
      code: 1,
      message: e.message
    }
  }
})

// 检测是否存在分类名
router.get('/hasCategoryName', async ctx => {
  const {name} = ctx.query
  if (name && await Category.findOne({name})) {
    ctx.body = {
      code: -1,
      message: '分类名已存在'
    }
    return
  }
  ctx.body = {
    code: 0,
    message: '分类名不存在'
  }
})

// 检测是否存在分类别名
router.get('/hasCategorySlug', async ctx => {
  const {slug} = ctx.query
  if (slug && await Category.findOne({slug})) {
    ctx.body = {
      code: -1,
      message: '分类别名已存在'
    }
    return
  }
  ctx.body = {
    code: 0,
    message: '分类别名不存在'
  }
})

export default router
