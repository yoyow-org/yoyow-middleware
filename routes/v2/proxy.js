import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

const module_list = {
  db: 1,
  network: 1,
  history: 1,
  crypto: 1,
  orders: 1
};

module.exports = {
  proxy: (req, res) => {
    let {module, method, params} = req.body;

    if (! module_list[module]) {
      return res.json({
        error: 'no such module, available: ' + Object.keys(module_list).join()
      })
    }

    try {
      params = JSON.parse(params);
    } catch (e) { console.error(e.message)}

    Api.proxy(module + "_api", method, params)
      .then((result) => {
        res.json(result)
      })
      .catch(reason => {
        res.json(reason);
      });
  }
};