import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

module.exports = {
  get_by_uid: (req, res) => {
    let {uid} = req.params;
    Api.getAccount(uid).then(uObj => {
      utils.success(res, uObj);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  histories: (req, res) => {
    let {uid} = req.params;
    // console.log(req.query)
    let {op_type, start, limit} = req.query;
    Api.getHistory(uid, op_type, start, limit).then(data => {
      utils.success(res, data);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  get_auth_permissions: (req, res) => {
    let {platform, account} = req.query;

    Api.getAuthUsers(platform, account).then(data => {
      if(data[0]["account"] != account){
        data = []
      }
      utils.success(res, data);
    }).catch(e => {
      utils.error(res, e);
    })
  }
};