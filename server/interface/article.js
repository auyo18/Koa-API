import mongoose from 'mongoose'
import Router from 'koa-router'
import Article from '../db/models/article'

const ObjectId = mongoose.Types.ObjectId

const router = new Router({
  prefix: '/article'
})

router.get('/article', async ctx => {
  const article = new Article({
    title: '13座“万亿城市”半年报出炉，谁更敢花钱？',
    content: '<p>13座“万亿城市”半年报出炉，谁更敢花钱？</p>>',
    category_id: '5d3925317ec24936ecb05ebc'
  })
  let result = await article.save()
  ctx.body = {
    code: 0,
    message: 'success',
    data: result
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
      $match: {_id: ObjectId('5d392556ff709e3a488776cc')}
    },
    {
      $project: {
        title: 1, content: 1, updateTime: 1, category: {
          _id: 1, name: 1, slug: 1, description: 1, thumbnail: 1
        }
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
