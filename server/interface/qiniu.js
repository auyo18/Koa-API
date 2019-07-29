import Router from 'koa-router'
import qiniu from 'qiniu'
import {verifyToken} from '../utils'
import config from '../../config'

let router = new Router({
  prefix: config.basePrefix + '/qiniu'
})

const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)

router.get('/qiniuToken', async ctx => {
  let verifyResult = verifyToken(ctx)
  if (!verifyResult) return

  const accessKey = 'DuiILLuIpOvQy4lo8IoihZm5wUVsrar1Ua5kFKIW' //可在个人中心=》秘钥管理查看
  const secretKey = '2-YOopHSeWp3S-tJJAcWGQApgtbfRaHUvYZrwsds' //可在个人中心=》秘钥管理查看
  const bucket = "juli"  //存储空间名称
  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  let options = {
    scope: bucket
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)


  let guid = (() => S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())()

  ctx.body = {
    code: 0,
    key: guid,
    'uptoken': uploadToken
  }
})


export default router
