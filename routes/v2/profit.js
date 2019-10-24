import Api from '../../lib/Api'
import config from '../../conf/config'
import utils from '../../lib/utils'
import Secure from '../../lib/Secure'

module.exports = {
  by_post: (req, res) => {
    // begin_period
    // end_period
    // platform
    // poster
    // pid
    req.query.platform = req.query.platform || config.platform_id
    if (
      !utils.ensureParams(req, res, [
        'poster',
        'pid',
        'platform',
        'begin_period',
        'end_period'
      ])
    ) {
      return
    }
    Api.getPostProfit(req.query)
      .then(asset => {
        utils.success(res, asset)
      })
      .catch(e => {
        utils.error(res, e)
      })
  },

  by_poster: (req, res) => {
    // begin_period
    // end_period
    // poster
    // lower_bound_index
    // limit
    if (
      !utils.ensureParams(req, res, ['poster', 'begin_period', 'end_period'])
    ) {
      return
    }
    Api.getPosterProfit(req.query)
      .then(asset => {
        utils.success(res, asset)
      })
      .catch(e => {
        utils.error(res, e)
      })
  },

  by_platform: (req, res) => {
    // begin_period
    // end_period
    // platform
    // lower_bound_index
    // limit
    req.query.platform = req.query.platform || config.platform_id
    if (
      !utils.ensureParams(req, res, ['platform', 'begin_period', 'end_period'])
    ) {
      return
    }
    Api.getPlatformProfit(req.query)
      .then(asset => {
        utils.success(res, asset)
      })
      .catch(e => {
        utils.error(res, e)
      })
  },

  by_score: (req, res) => {
    // account
    // period
    if (!utils.ensureParams(req, res, ['account', 'period'])) {
      return
    }
    Api.getScoreProfit(req.query)
      .then(asset => {
        utils.success(res, asset)
      })
      .catch(e => {
        utils.error(res, e)
      })
  }
}
