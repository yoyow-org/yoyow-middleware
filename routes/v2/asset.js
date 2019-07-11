import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

module.exports = {
  get_by_name: (req, res) => {
    let {asset_name} = req.params;
    asset_name = asset_name.toLocaleUpperCase();

    Api.getAsset(asset_name).then(asset => {
      utils.success(res, asset);
    }).catch(e => {
      utils.error(res, e);
    })
  }
};