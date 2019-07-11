import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

module.exports = {
  get_by_block_number: (req, res) => {
    let {block_num} = req.params;
    Api.proxy('db_api', 'get_block', [block_num]).then(block => {
      utils.success(res, block);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  is_confirmed: (req, res) => {
    let {block_num} = req.params;
    Api.confirmBlock(block_num).then(bool => {
      utils.success(res, bool);
    }).catch(e => {
      utils.error(res, e);
    });
  }
};