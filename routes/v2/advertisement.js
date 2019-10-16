import Api from '../../lib/Api'
import utils from '../../lib/utils'
import config from '../../conf/config'
import errorUtils from '../../lib/ErrorUtils'

module.exports = {
  // 创建广告位
  async create_advertising(req, res) {
    let dataBody = req.decryptedData
    try {
      let apiRes = await Api.createAdvertising(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, errorUtils.formatError(e))
    }
  },
  // 更新广告位
  async update_advertising(req, res) {
    let dataBody = req.decryptedData
    try {
      let apiRes = await Api.updateAdvertising(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, errorUtils.formatError(e))
    }
  },
  // 确认广告位
  async confirm_advertising(req, res) {
    let dataBody = req.decryptedData
    try {
      let apiRes = await Api.confirmAdvertising(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, errorUtils.formatError(e))
    }
  },
  // 获取广告位
  async list_advertisings(req, res) {
    let {
      platform = config.platform_id,
      lower_bound_advertising = 0,
      limit = 100
    } = req.query
    Api.getAdvertisingList({
      platform,
      lower_bound_advertising,
      limit
    })
      .then(tx => {
        utils.success(res, tx)
      })
      .catch(e => {
        utils.error(res, e)
      })
  },
  // 获取广告位订单
  async list_advertising_orders(req, res) {
    let { filter } = req.query
    if (filter == 0) {
      list_purchaser_order(req, res)
    } else {
      list_ads_aid_order(req, res)
    }
  }
}
// 获取购买者订单
async function list_purchaser_order(req, res) {
  let { purchaser, lower_bound_advertising_order = 0, limit = 100 } = req.query

  Api.getAdPurchaserOrders({
    purchaser,
    lower_bound_advertising_order: '2.19.' + lower_bound_advertising_order,
    limit
  })
    .then(tx => {
      utils.success(res, tx)
    })
    .catch(e => {
      utils.error(res, e)
    })
}
// 获取广告位id订单
async function list_ads_aid_order(req, res) {
  let {
    platform = config.platform_id,
    advertising_aid_type,
    lower_bound_advertising_order = 0,
    limit = 100
  } = req.query
  Api.getAdAdaAidOrders({
    platform,
    advertising_aid_type,
    lower_bound_advertising_order,
    limit
  })
    .then(tx => {
      utils.success(res, tx)
    })
    .catch(e => {
      utils.error(res, e)
    })
}
