import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

module.exports = {
  by_post: (req, res) => {
    // begin_period
    // end_period
    // platform
    // poster
    // pid
    req.params.platform = req.params.platform || config.platform_id;

    Api.getPostProfit(req.params).then(asset => {
      utils.success(res, asset);
    }).catch(e => {
      utils.error(res, e);
    })
  },

  by_poster: (req, res) => {
    // begin_period
    // end_period
    // poster
    Api.getPosterProfit(req.params).then(asset => {
      utils.success(res, asset);
    }).catch(e => {
      utils.error(res, e);
    })
  },

  by_platform: (req, res) => {
    // begin_period
    // end_period
    // platform
    req.params.platform = req.params.platform || config.platform_id;
    Api.getPlatformProfit(req.params).then(asset => {
      utils.success(res, asset);
    }).catch(e => {
      utils.error(res, e);
    })
  },

  by_score: (req, res) => {
    // account
    // period
    Api.getScoreProfit(req.params).then(asset => {
      utils.success(res, asset);
    }).catch(e => {
      utils.error(res, e);
    })
  }
};