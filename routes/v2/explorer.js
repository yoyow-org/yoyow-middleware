// 浏览器api
import api from '../../lib/explorerApi'
import utils from '../../lib/utils'

export default {
  // platform
  // poster
  // limit
  // offset
  get_post_histories: (req, res) => {
    api.getPostHistories(req.query)
      .then(result => {
        utils.success(res, result)
      })
      .catch(e => {
        utils.error(res, errorUtils.formatError(e))
      })
  },
  // platform
  // score_account
  // limit
  // offset
  get_score_histories: (req, res) => {
    api.getScoreHistories(req.query)
      .then(result => {
        utils.success(res, result)
      })
      .catch(e => {
        utils.error(res, errorUtils.formatError(e))
      })
  }
}