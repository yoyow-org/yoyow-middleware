// 浏览器api
import api from '../../lib/explorerApi'
import utils from '../../lib/utils'
import errorUtils from '../../lib/ErrorUtils'

export default {
  // platform
  // poster
  // limit
  // offset
  get_post_histories: (req, res) => {
    api.getPostHistories(req.query)
      .then(result => {
        res.json(JSON.parse(result))
      })
      .catch(e => {
        utils.error(res, errorUtils.formatError({
          message: e
        }))
      })
  },
  // platform
  // score_account
  // limit
  // offset
  get_score_histories: (req, res) => {
    api.getScoreHistories(req.query)
      .then(result => {
        res.json(JSON.parse(result))
      })
      .catch(e => {
        utils.error(res, errorUtils.formatError({
          message: e
        }))
      })
  },

}