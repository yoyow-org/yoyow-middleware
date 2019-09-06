import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

const errorUtils  = require('../../lib/ErrorUtils');

//todo 安全认证 Secure.validQueue

module.exports = {
  get_by_id: (req, res) => {
    utils.success(res, req.model_data);
  },
  score: (req, res) => {
    // from_account:30833
    // platform:33313
    // poster:31036
    // pid:1
    // score:5
    // csaf:10

    let bodyData = req.decryptedData;

    bodyData.platform = bodyData.platform  || config.platform_id;
    bodyData.sign_platform = bodyData.sign_platform  || config.platform_id;
    bodyData.score    = parseInt(bodyData.score);

    // console.log(bodyData);

    Api.scoreCreate(bodyData).then(result => {
      utils.success(res, result);
    }).catch(e => {
      utils.error(res, errorUtils.formatError(e));
    });
  },

  get_score: (req, res) => {
    // platform
    // poster
    // pid
    // from_account
    req.body.platform = req.params.platform || config.platform_id;

    Api.getPostScore(req.body).then(result => {
      utils.success(res, result);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  list_scores: (req, res) => {
    // platform
    // poster
    // pid
    // lower_bound_score
    // limit
    // list_cur_period
    req.query.platform = req.params.platform || config.platform_id;
    // console.log(req.query)

    Api.listPostScores(req.query).then(result => {
      utils.success(res, result);
    }).catch(e => {
      utils.error(res, e);
    });
  },
  // 创建 新文章
  create__simple: async (req, res) => {
    // 简单模式
    // poster  
    // title
    // body    => 用来计算hash， 不上链
    // url     => 放在extra data字段中（参考接入规范）
    // license_lid => license id

    let bodyData = req.decryptedData;

    bodyData.platform = bodyData.platform || config.platform_id;    // 默认设为平台
    bodyData.poster   = bodyData.poster   || bodyData.platform;     // poster默认为平台

    // if(! utils.ensureParams(req, res, ['license_lid'])) return;

    try {
      let result = await Api.post_simple(bodyData);
      if(result.code) {
        throw result;
      }
      utils.success(res, result);
    } catch (e) {
      utils.error(res, e);
    }
  },

    // 创建 新文章
    create_post: async (req, res) => {
      // 原始的接口
      // poster  => 默认为：平台
      // post_pid
      // title
      // body    => 用来计算hash， 不上链
      // extra_data
      // ext
      // hash_value
      // origin_platform 
      // origin_poster
      // origin_post_pid
      // license_lid => license id

      let bodyData = req.decryptedData;
      // let bodyData = req.params;

  
      bodyData.platform = bodyData.platform || config.platform_id;    // 默认设为平台
      bodyData.poster   = bodyData.poster   || bodyData.platform;     // poster默认为平台
      // console.log(bodyData);
  
      // if(! utils.ensureParams(req, res, ['license_lid'])) return;
  
      try {
        let result = await Api.post(bodyData);
        if(result.code) {
          throw result;
        }
        utils.success(res, result);
      } catch (e) {
        utils.error(res, e);
      }
    },



  update: (req, res) => {
    let {platform, poster, post_pid, title, body, extra_data} = req.decryptedData;
    Api.postUpdate(platform, poster, post_pid, title, body, extra_data).then(tx => {
      utils.success(res, tx);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  list: (req, res) => {
    let {platform, poster, start_time, limit} = req.query;
    // let platform = config.platform_id;

    Api.getPostList(platform, poster, limit, start_time).then(tx => {
      utils.success(res, tx);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  reward_proxy: (req, res) => {
    // from_account:30833
    // platform:33313
    // poster:31036
    // pid:1
    // amount:5 // 尚未除精度
    let bodyData = req.decryptedData;
    bodyData.platform = bodyData.platform  || config.platform_id;
    bodyData.sign_platform = bodyData.sign_platform  || config.platform_id;

    Api.rewardProxy(bodyData).then(result => {
      utils.success(res, result);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  get_post: (req, res) => {
    let {platform, poster, post_pid} = req.query;
    // console.log(platform, poster, post_pid)
    Api.getPost(platform, poster, post_pid).then(post => {
      utils.success(res, post);
    }).catch(e => {
      utils.error(res, e);
    });
  }

};