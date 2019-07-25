import Koa from 'koa'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import bodyParser from 'koa-bodyparser'
import mongoose from 'mongoose'
import config from '../config'
import article from './interface/article'
import category from './interface/category'

const app = new Koa()

app.use(conditional())
app.use(etag())
app.use(bodyParser({
  extendTypes: ['json', 'form', 'text']
}))
app.use(article.routes()).use(article.allowedMethods())
app.use(category.routes()).use(category.allowedMethods())

app.use(ctx => {
  ctx.body = {
    code: 0,
    message: 'success',
    data: 'julipay api'
  }
})
console.time('数据库连接时间')
mongoose.connect(config.dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true
}, err => {
  if (err) {
    console.warn('数据库连接失败：' + err.message)
  } else {
    console.log('数据库连接成功')
    console.timeEnd('数据库连接时间')
  }
})

app.listen(3000)
