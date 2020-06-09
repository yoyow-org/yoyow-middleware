import Api from '../../lib/Api';
import config from '../../conf/config';
import utils from '../../lib/utils';
import Secure from '../../lib/Secure';

module.exports = {
  get_by_uid: (req, res) => {
    let { uid } = req.params;
    Api.getAccount(uid).then(uObj => {
      utils.success(res, uObj);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  histories: (req, res) => {
    let { uid } = req.params;
    // console.log(req.query)
    let { op_type, start, limit } = req.query;
    Api.getHistory(uid, op_type, start, limit).then(data => {
      utils.success(res, data);
    }).catch(e => {
      utils.error(res, e);
    });
  },

  get_auth_permissions: (req, res) => {
    let { platform, account } = req.query;

    Api.getAuthUsers(platform, account).then(data => {
      if (data[0]["account"] != account) {
        data = []
      }
      utils.success(res, data);
    }).catch(e => {
      utils.error(res, e);
    })
  },

  create_license: async (req, res) => {
    let dataBody = req.decryptedData
    try {
      let apiRes = await Api.createLicense(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, e)
    }
  },

  lock_balance: async (req, res) => {
    let dataBody = req.decryptedData
    console.log(dataBody)
    try {
      let apiRes = await Api.lockBalance(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, e)
    }
  },

  collect_csaf: async (req, res) => {
    let dataBody = req.decryptedData
    console.log(dataBody)
    try {
      let apiRes = await Api.collectCsaf(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, e)
    }
  },

  collect_benefit_csaf: async (req, res) => {
    let dataBody = req.decryptedData
    console.log(dataBody)
    try {
      let apiRes = await Api.collectBenefitCsaf(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, e)
    }
  },

  collect_benefit_witness_wages: async (req, res) => {
    let dataBody = req.decryptedData
    console.log(dataBody)
    try {
      let apiRes = await Api.collectBenefitWitnessWages(dataBody)
      if (apiRes.code) {
        throw apiRes
      }
      utils.success(res, apiRes)
      // res.json
    } catch (e) {
      utils.error(res, e)
    }
  },

};