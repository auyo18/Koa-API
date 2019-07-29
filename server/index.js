import Koa from 'koa'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import bodyParser from 'koa-bodyparser'
import mongoose from 'mongoose'
import cors from '@koa/cors'
import config from '../config'
import site from './interface/site'
import article from './interface/article'
import category from './interface/category'
import user from './interface/user'
import qiniu from './interface/qiniu'

const app = new Koa()

app.use(cors())
app.use(conditional())
app.use(etag())
app.use(bodyParser({
  extendTypes: ['json', 'form', 'text']
}))

app.use(site.routes()).use(site.allowedMethods())
app.use(article.routes()).use(article.allowedMethods())
app.use(category.routes()).use(category.allowedMethods())
app.use(user.routes()).use(user.allowedMethods())
app.use(qiniu.routes()).use(qiniu.allowedMethods())

app.use(ctx => {
  ctx.body = {
    name: 'julipay',
    author: 'JaMie',
    WeChat: 'luomo621798',
    qq: '674157529',
    site: 'https://www.julipay.com',
    powered: [
      'React',
      'Vue',
      'Koa',
      'Node.js',
      'MongoDB',
      'Nginx'
    ]
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
