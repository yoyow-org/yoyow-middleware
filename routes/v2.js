var express = require('express')
var router = express.Router()

const Account = require('./v2/account')
const Asset = require('./v2/asset')
const Proxy = require('./v2/proxy')
const Post = require('./v2/post')
const Block = require('./v2/block')
const Profit = require('./v2/profit')
const Transfer = require('./v2/transfer')
// ad module
const Advertisement = require('./v2/advertisement')
import Secure from '../lib/Secure'
// 浏览器
import explorer from './v2/explorer'

router
  .post('/proxy', Proxy.proxy)

  .get('/accounts/:uid', Account.get_by_uid)
  .get('/accounts/:uid/histories', Account.histories)

  .get('/authPermissions', Account.get_auth_permissions)

  .get('/assets/:asset_name', Asset.get_by_name)

  .get('/blocks/:block_num', Block.get_by_block_number)
  .get('/blocks/:block_num/confirmed', Block.is_confirmed)

  .get('/posts', Post.get_post) // 根据id获取文章
  .post('/posts/score', Secure.validQueue, Post.score) // 对文章打分
  .get('/posts/listScores', Post.list_scores) // 文章的所有打分列表
  .post('/posts/reward-proxy', Secure.validQueue, Post.reward_proxy) // 打赏文章 - 由平台代理

  .post('/posts/simple', Secure.validQueue, Post.create__simple)
  .get('/posts/getPostList', Post.list)

  .post('/transfer', Secure.validQueue, Transfer.transfer)
  .post('/posts', Secure.validQueue, Post.create_post)
  // 创建广告位
  .post('/advertisings', Secure.validQueue, Advertisement.create_advertising)
  // 更新广告位
  .post(
    '/advertising/update',
    Secure.validQueue,
    Advertisement.update_advertising
  )
  // 确认广告位
  .post(
    '/advertising/confirm',
    Secure.validQueue,
    Advertisement.confirm_advertising
  )
  .get('/advertisings', Advertisement.list_advertisings)
  // 获取购买者的广告位订单
  .get('/advertising_orders', Advertisement.list_advertising_orders)

  .get('/profits/post', Profit.by_post)
  .get('/profits/poster', Profit.by_poster)
  .get('/profits/platform', Profit.by_platform)
  .get('/profits/score', Profit.by_score)
  // 获取文章打分
  .get('/posts/score', Post.get_score)
  // 查询历史内容
  .get('/post_histories', explorer.get_post_histories)
  // 查询历史打分
  .get('/score_histories', explorer.get_score_histories)

module.exports = router
