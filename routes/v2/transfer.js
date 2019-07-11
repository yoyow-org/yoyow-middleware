import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

module.exports = {
    transfer: (req, res) => {
        let {uid, amount, asset_id, memo} = req.decryptedData;
        console.log(req.decryptedData);
        console.log(req);
        let key = config.secondary_key;
        if(asset_id && asset_id != 0){
          key = config.active_key;
        }else{
          asset_id = 0;
        }
        Api.transfer(config.platform_id, asset_id, key, uid, amount, config.use_csaf, config.to_balance, memo, config.memo_key).then(tx => {
          utils.success(res, tx);
        }).catch(e => {
          console.log(e);
          utils.error(res, e);
        });
    }
}



