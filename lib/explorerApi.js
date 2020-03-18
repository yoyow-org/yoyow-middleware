import request from 'request'
import config from '../conf/config'

const api = {
  get: (url, data) => {
    const querys = []
    for (let k in data) {
      querys.push(`${k}=${data[k]}`)
    }
    return new Promise((resolve, reject) => {
      request.get(
        `${config.explorer_url}/${url}?${querys.join('&')}`,
        function (err, res, body) {
          if (!err && res.statusCode == 200) {
            resolve(body)
          } else {
            reject(err)
          }
        }
      )
    })
  },
  post: (url, data) => {
    return new Promise((resolve, reject) => {
      request.post({
        body: data,
        json: true,
        url: `${config.explorer_url}/${url}`
      }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
          resolve(body)
        } else {
          reject(err)
        }
      })
    })
  }
}

export default {
  /**
   * 获取历史内容
   * @param {Number|String} platform 平台id
   * @returns {Promise<U>|Promise.<T>|*|Promise}
   */
  getPostHistories: (data) => {
    return api.get('/post_histories_with_dynamic_infos', data)
  },
  /**
   * 获取历史打分
   * @param {Number|String} platform 平台id
   * @returns {Promise<U>|Promise.<T>|*|Promise}
   */
  getScoreHistories: (data) => {
    return api.get('/score_histories', data)
  }
}
