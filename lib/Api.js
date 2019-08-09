import { ChainStore, ChainTypes, PrivateKey, AccountUtils, Aes, TransactionBuilder, hash } from "yoyowjs-lib";
import config from "../conf/config";
import secureRandom from 'secure-random';
import { Long } from 'bytebuffer';
import { PageWrapper } from './entity';
import utils from './utils';
import ErrorUtils from './ErrorUtils';

const {Apis} = require("yoyowjs-ws");

let dynamic_global_params_type = `2.${parseInt(ChainTypes.impl_object_type.dynamic_global_property, 10)}.0`;

let _getAssetPrecision = (precision) => {
  return Math.pow(10, precision);
};

/**
 * Api 操作
 */
class Api {

  constructor() {
    this.inited = 0;
  }

  async init() {
    if (this.inited !== 0) {
      return;
    } else {
      this.inited = 1;
    }
    Apis.setAutoReconnect(true);
    Apis.setRpcConnectionStatusCallback(async (msg) => {
      //open,error,closed
      console.log('Api status:', msg);
      if (msg === "closed") {
        Apis.reset(config.apiServer);
      }
    });

    let api_instance = await Apis.instance(config.apiServer, true);
    await api_instance.init_promise;
    console.log('Api connected......');

    await ChainStore.init();
  }

  close() {
    Apis.close();
  }

  /**
   * 获取账户信息
   * @param {Number|String} uid yoyow账号
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(uObj yoyow用户对象), reject(e 异常信息)
   */
  getAccount(uid) {
    return new Promise((resolve, reject) => {
      if (!AccountUtils.validAccountUID(uid)) {
        return reject({
          code: 2002,
          message: '无效的账号'
        });
      }
      ChainStore.fetchAccountByUid(uid).then(uObj => {
        if (null == uObj) {
          return reject({
            code: 2001,
            message: '账号不存在'
          });
        }

        Promise.all([
          ChainStore.fetchAccountStatisticsByUid(uid),
          ChainStore.fetchAccountBalances(uid, [])
        ]).then(res => {
          let [statistics, assets] = res;
          uObj.statistics = {
            obj_id: statistics.id,
            core_balance: statistics.core_balance,
            csaf: statistics.csaf,
            prepaid: statistics.prepaid,
            total_witness_pledge: statistics.total_witness_pledge,
            total_committee_member_pledge: statistics.total_committee_member_pledge,
            total_platform_pledge: statistics.total_platform_pledge,
            releasing_witness_pledge: statistics.releasing_witness_pledge,
            releasing_committee_member_pledge: statistics.releasing_committee_member_pledge,
            releasing_platform_pledge: statistics.releasing_platform_pledge
          };
          uObj.assets = assets;
          resolve(uObj);
        }).catch(e => {
          reject(e);
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

  /**
   * 获取账户发布的文章数量
   * @param poster
   * @returns {Promise<*>}
   */
  async getLastPid(poster) {
    let stat = await ChainStore.fetchAccountStatisticsByUid(poster);
    return stat.last_post_sequence;
  }

  /**
   * 获取账户发布的文章数量
   * @param poster
   * @returns {Promise<*>}
   */
  async getAccountStatistic(poster) {
    return await ChainStore.fetchAccountStatisticsByUid(poster);
  }

  /**
   * 转账
   * @param {Number|String} from_uid 转出yoyow账号
   * @param {Number} asset_id 资产id
   * @param {String} from_key 转出账号零钱私钥
   * @param {Number|String} to_uid 转入yoyow账号
   * @param {Number} amount 转账数额
   * @param {boolean} [use_csaf = true] 是否使用积分 - 默认为 true
   * @param {boolean} [to_balance = true] 是否转账到零钱
   * @param {String} [memo] 转账备注
   * @param {String} [memo_key] 备注密钥 - 需要写入备注时必填
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve({block_num 操作所属块号, txid 操作id}), reject(e 异常信息)
   */
  transfer(from_uid, asset_id, from_key, to_uid, amount, use_csaf = true, to_balance = true, memo, memo_key) {
    let fetchFromKey = new Promise((resolve, reject) => {
      return this.getAccount(from_uid).then(uObj => {
        resolve(uObj);
      }).catch(e => {
        reject(e);
      });
    });

    let fetchToKey = new Promise((resolve, reject) => {
      return this.getAccount(to_uid).then(uObj => {
        resolve(uObj);
      }).catch(e => {
        reject(e);
      });
    });

    let fetchAsset = new Promise((resolve, reject) => {
      return this.getAsset(asset_id).then(asset => {
        resolve(asset);
      }).catch(e => {
        reject(e);
      })
    });

    return new Promise((resolve, reject) => {
      if (!utils.isNumber(amount)) {
        reject({
          code: 2003,
          message: '无效的转账金额'
        });
      } else if (memo && !memo_key) {
        reject({
          code: 2004,
          message: '无效的备注私钥'
        });
      } else {
        Promise.all([fetchFromKey, fetchToKey, fetchAsset]).then(res => {
          let memoFromKey = res[0].memo_key;
          let memoToKey = res[1].memo_key;
          let retain_count = _getAssetPrecision(res[2].precision); //资产精度参数
          let asset = {
            amount: Math.round(amount * retain_count),
            asset_id: asset_id
          };
          let extensions_data = {
            from_prepaid: asset,
            to_balance: asset
          }
          if (!to_balance) {
            extensions_data = {
              from_prepaid: asset,
              to_prepaid: asset
            }
          }

          let op_data = {
            from: from_uid,
            to: to_uid,
            amount: asset
          };
          if (asset_id == 0) op_data.extensions = extensions_data;

          if (memo && memo.trim() != '') {

            let entropy = parseInt(secureRandom.randomUint8Array(1)[0]);
            var long = Long.fromNumber(Date.now());
            let nonce = long.shiftLeft(8).or(Long.fromNumber(entropy)).toString();

            // TODO: 用户之间通过平台转账操作，不做签名，因为平台无法获取到用户私钥
            let message = config.platform_id == from_uid ? Aes.encrypt_with_checksum(
              PrivateKey.fromWif(memo_key),
              memoToKey,
              nonce,
              new Buffer(memo, 'utf-8')
            ) : new Buffer('uncrypto' + memo, 'utf-8').toString('hex');
            let memo_data = {
              from: memoFromKey,
              to: memoToKey,
              nonce,
              message: message
            };

            op_data.memo = memo_data;
          }

          let tr = new TransactionBuilder();
          tr.add_type_operation('transfer', op_data);
          return tr.set_required_fees(from_uid, false, use_csaf).then(() => {
            tr.add_signer(PrivateKey.fromWif(from_key));
            this.__broadCast(tr).then(res => resolve(res)).catch(err => reject(err));
          }).catch(e => {
            reject(e);
          });
        }).catch(e => {
          reject(e);
        });
      }
    });
  }

  /**
   * 获取账户操作历史
   * @param {Number} uid yoyow账户id
   * @param {Number} op_type 查询op类型 '0' 为 转账op，默认为null 即查询所有OP类型
   * @param {Number} start 查询开始编号，为0时则从最新记录开始查询，默认为0
   * @param {Number} limit 查询长度，最大不可超过100条，默认为10
   * @returns {Promise<PageWrapper>|Promise.<T>|*|Promise} resolve(Array 历史记录对象数组), reject(e 异常信息)
   */
  getHistory(uid, op_type = null, start = 0, limit = 10) {
    return this.getAccount(uid).then(uObj => {
      return ChainStore.fetchRelativeAccountHistory(uid, op_type, 0, limit, start).then(res => {
        return res;
      }).catch(e => {
        return Promise.reject(e);
      });
    }).catch(e => {
      return Promise.reject(e);
    });
  }

  /**
   * 获取授权平台 的用户授权信息
   * @param {Number} platform yoyow账户id
   * @param {Number} lower_bound_account 起始账户id
   * @param {Number} limit 查询长度，最大不可超过100条，默认为1
   * @returns {Promise<PageWrapper>|Promise.<T>|*|Promise} resolve(Array 历史记录对象数组), reject(e 异常信息)
   */
  getAuthUsers(platform, lower_bound_account = 0, limit = 1) {

    return new Promise((resolve, reject) => {
      Apis.instance().db_api().exec("list_account_auth_platform_by_platform", [platform, lower_bound_account, limit]).then(post => {
        resolve(post);
      }).catch(e => {
        reject(e);
      });
    })
  }

  /**
   * 验证块是否为不可退回
   * - 如 将交易所属块号传入，以验证次交易为不可退回
   * @param {Number} block_num 查询交易所属块号
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(bool 是否不可退回), reject(e 异常信息)
   */
  confirmBlock(block_num) {
    return Apis.instance().db_api().exec("get_objects", [
      [dynamic_global_params_type]
    ]).then(global_params => {
      let irreversible_block_num = global_params[0].last_irreversible_block_num;
      return block_num <= irreversible_block_num;
    }).catch(e => {
      return Promise.reject(e);
    });
  }


  /**
   * @description: 
   * @param {String} origin_platform
   * @param {String} origin_poster
   * @param {String} origin_post_pid
   * @return: 
   */
  async getPostPermissions(origin_platform, origin_poster, origin_post_pid) {
    console.log("hello");
    console.log(this.getPost);
    let post_info = await this.getPost(origin_platform, origin_poster, origin_post_pid);
    console.log(post_info);
    return post_info.permission_flags;
  }




  /**
   * 发文章
   * - 若属于转发文章 则需传入转发参数
   * @param {Number} platform 平台 yoyow 账号
   * @param {Number} poster 发帖人 yoyow 账号
   * @param {Number} post_pid 文章编号 由平台管理和提供
   * @param {String} title 文章标题
   * @param {String} body 文章内容
   * @param {String} extra_data 拓展信息 JSON 字符串, 文章的url信息等
   * @param {String} [hash_value = null] 自定义hash, 默认值为body字段的sha256摘要
   * @param {Number} [origin_platform = null] 原文章发文平台 
   * @param {Number} [origin_poster = null] 原文章发文人 
   * @param {Number} [origin_post_pid = null] 原文章编号 
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(block_num 操作所属块号, txid 操作id), reject(e 异常信息)
   */
  async post({
    platform,
    poster,
    post_pid,
    title,
    body,
    extra_data,
    extensions = {},
    hash_value = null,
    origin_platform = null,
    origin_poster = null,
    origin_post_pid = null
  }) {
    if (post_pid == undefined) {
      post_pid = await this.getLastPid(poster) + 1;
    }

    if (extensions.sign_platform == undefined) {
      extensions.sign_platform = config.platform_id;
    }

    let op_data = {
      post_pid: post_pid,
      platform: platform,
      poster: poster,
      hash_value: hash_value || hash.sha256(body, 'hex').toString(),
      extra_data: extra_data,
      title: title,
      body: body,
      extensions: extensions
    };

    console.log(op_data);


    // 转发情况写入转发参数
    if (origin_post_pid && origin_platform && origin_poster) {
      op_data.origin_post_pid = origin_post_pid;
      op_data.origin_platform = origin_platform;
      op_data.origin_poster = origin_poster;

      let permission_flags = await this.getPostPermissions(origin_platform, origin_poster, origin_post_pid);

      // 不允许转发
      if (extensions.post_type === 2 && ((utils.postPermissions.Post_Permission_Forward & permission_flags) === 0)) {
        return {
          code: 2000,
          message: "文章不允许转发"
        };
      };
      if (extensions.post_type === 1 && ((utils.postPermissions.Post_Permission_Comment & permission_flags) === 0)) {
        return {
          code: 2000,
          message: "文章不允许评论"
        };
      };
    };

    let tr = new TransactionBuilder();
    tr.add_type_operation('post', op_data);
    await tr.set_required_fees(poster, false, true);
    tr.add_signer(PrivateKey.fromWif(config.secondary_key));

    let common_return = await this.__broadCast(tr);
    common_return.post = op_data;

    return common_return;
  }


  /**
   * 简易版本的发文章 - 默认为发新文章
   * @param {Number} platform 平台 yoyow 账号
   * @param {Number} poster 发帖人 yoyow 账号
   * @param {Number} post_pid 文章编号 由平台管理和提供
   * @param {String} title 文章标题
   * @param {String} body 文章内容
   * @returns {Object} (block_num 操作所属块号, txid 操作id, post) | (e 异常信息)
   */
  async post_simple({
    platform,
    poster,
    title,
    body,
    url,
    license_lid
  }) {
    let extra_data = {
      url
    };

    let post_pid = await this.getLastPid(poster) + 1;
    let op_data = {
      platform: platform,
      poster: poster,
      post_pid: post_pid,
      hash_value: hash.sha256(body, 'hex').toString(),
      extra_data: JSON.stringify(extra_data),
      title: title,
      body: '',
      extensions: {
        "post_type": 0,
        "license_lid": license_lid,
        "permission_flags": 255,
        "sign_platform": config.platform_id
      }
    };

    let tr = new TransactionBuilder();
    tr.add_type_operation('post', op_data);
    await tr.set_required_fees(poster, false, true);
    tr.add_signer(PrivateKey.fromWif(config.secondary_key));

    let common_return = await this.__broadCast(tr);
    common_return.post = op_data;
    //   common_return.post_id = `${poster}_${post_pid}`;

    return common_return;
  }

  async postUpdate__simple({
    platform,
    poster,
    title,
    post_pid,
    body,
    url,
    license_lid
  }) {
    let extra_data = {
      url
    };

    try {
      let op_data = {
        platform: platform,
        poster: poster,
        post_pid: post_pid,
        hash_value: hash.sha256(body, 'hex').toString(),
        extra_data: JSON.stringify(extra_data),
        title: title,
        body: '',
        extensions: {
          "license_lid": license_lid,
          "permission_flags": 255,
          "sign_platform": config.platform_id
          //todo 其他字段支持
        },
      };

      let tr = new TransactionBuilder();
      tr.add_type_operation('post_update', op_data);
      await tr.set_required_fees(poster, false, true);
      tr.add_signer(PrivateKey.fromWif(config.secondary_key));
      return await this.__broadCast(tr);
    } catch (e) {
      return {
        code: 2000,
        message: e.message
      }
    }
  }

  /**
   * 更新文章 - 旧版接口待更新
   * - title body extra_data 参数至少有一个不为空
   * @param {Number} platform 平台 yoyow 账号
   * @param {Number} poster 发帖人 yoyow 账号
   * @param {Number} post_pid 文章编号 由平台管理和提供
   * @param {String} [title = null] 文章标题
   * @param {String} [body = null] 文章内容
   * @param {String} [extra_data = null] 拓展信息 JSON 字符串
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(block_num 操作所属块号, txid 操作id), reject(e 异常信息)
   */
  async postUpdate({
    platform,
    poster,
    post_pid,
    title,
    body,
    extra_data,
    extensions = {},
    hash_value = null
  }) {

    let op_data = {
      post_pid: post_pid,
      platform: platform,
      poster: poster
    };

    if (title) op_data.title = title;

    if (body) {
      op_data.body = body;
    }

    if (hash_value) {
      op_data.hash_value = hash_value;
    } else if (body) {
      op_data.hash_value = hash.sha256(body, 'hex').toString();
    }

    if (extra_data) op_data.extra_data = extra_data;

    if (extensions) op_data.extensions = extensions;

    let tr = new TransactionBuilder();
    tr.add_type_operation('post_update', op_data);
    await tr.set_required_fees(poster, false, true)
    tr.add_signer(PrivateKey.fromWif(config.secondary_key));

    let common_return = await this.__broadCast(tr);
    common_return.post = op_data;

    return common_return;
  }

  /**
   * 获取单个文章
   * @param {Number} platform  平台 yoyow 账号
   * @param {Number} poster 发文人 yoyow 账号
   * @param {Number} post_pid 文章编号
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(post 文章对象), reject(e 异常信息)
   */
  getPost(platform, poster, post_pid) {
    return new Promise((resolve, reject) => {
      Apis.instance().db_api().exec("get_post", [platform, poster, post_pid]).then(post => {
        resolve(post);
      }).catch(e => {
        reject(e);
      });
    });
  }

  /**
   * 根据平台和发帖人获取文章列表
   * 首次加载开始时间不传
   * 其他次加载，将上次数据的最后一条的create_time传入
   * limit 最小 1 最大 99
   * @param {Number|String} platform 平台 yoyow 账号
   * @param {Number} [poster = null] 发文人 yoyow 账号
   * @param {Number} limit 查询条数
   * @param {String} start 开始时间 - 'yyyy-MM-ddThh:mm:ss' ISOString
   * @param lower_bound
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(list 文章列表), reject(e 异常信息)
   */
  getPostList(platform, poster = null, limit = 20, start = new Date().toISOString().split('.')[0], lower_bound = '0.0.0') {
    if (limit <= 0) limit = 1;
    if (limit > 99) limit = 100;

    return new Promise((resolve, reject) => {
      Apis.instance().db_api().exec("get_posts_by_platform_poster", [platform, poster, [start, '1970-01-01T00:00:00'], lower_bound, limit]).then(posts => {
        resolve(posts);
      }).catch(e => {
        reject(e);
      });
    });
  }

  /**
   * 添加资产到用户资产白名单中
   * @param {Number} uid - 目标账户id
   * @param {Number} asset_id - 资产id
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve({block_num 操作所属块号, txid 操作id}), reject(e 异常信息)
   */
  updateAllowedAssets(uid, asset_id) {
    let op_data = {
      account: uid,
      assets_to_add: [asset_id],
      assets_to_remove: []
    };
    let tr = new TransactionBuilder();
    tr.add_type_operation('account_update_allowed_assets', op_data);
    return tr.set_required_fees(uid, false, true).then(() => {
      tr.add_signer(PrivateKey.fromWif(config.secondary_key));
      return this.__broadCast(tr);
    })
  }

  /**
   * 获取资产信息
   * @param {String | Number} search - 资产符号（大写） 或 资产id
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(asset 资产对象), reject(e 异常信息)
   */
  getAsset(search) {
    return ChainStore.fetchAsset(search).then(asset => {
      if (asset) return asset;
      else return Promise.reject({
        code: 2006,
        message: '无效的资产符号或id'
      });
    });
  }

  /**
   * 获取平台信息
   * @param {Number} uid - 平台所有者账号uid
   * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(platform 平台对象), reject(e 异常信息)
   */
  getPlatformById(uid) {
    return ChainStore.fetchPlatformByUid(uid);
  }

  async getInfo() {
    return await this.proxy('db_api', 'get_objects', [
      [dynamic_global_params_type]
    ]);
  }

  /**
   * 获取转账二维码
   * @param {String | Number} toAccount - 平台所有者账号uid
   * @param {Number} amount - 转账金额
   * @param {String} memo - 转账备注
   * @param {String | Number} asset - 转账资产符号 或 资产id
   */
  getQRReceive(toAccount, amount, memo, asset) {
    let canMemo = true;
    if (utils.isNumber(amount) && amount >= 0 && !utils.isEmpty(memo))
      canMemo = false;
    else {
      amount = 0;
      memo = '';
    }
    return this.getAsset(asset).then(a => {
      let {
        asset_id,
        precision,
        symbol
      } = a;
      let resultObj = {
        type: 'transfer-for-fix',
        toAccount,
        amount,
        memoText: memo,
        canMemo,
        transferBalance: true,
        tokenInfo: asset_id == 0 ? null : {
          asset_id,
          precision,
          symbol
        }
      }
      return JSON.stringify(resultObj);
    });
  }


  /**
   * 获取一篇文章在某个周期范围内的收益详情
   * @param {Number|String} begin_period
   * @param {Number|String} end_period
   * @param {Number|String} platform
   * @param {Number|String} poster
   * @param {Number|String} pid
   * @returns {Promise<any>}
   */
  getPostProfit({
    begin_period,
    end_period,
    platform,
    poster,
    pid
  }) {
    return this.proxy('db_api', 'get_post_profits_detail', [begin_period, end_period, platform, poster, pid]);
  }

  /**
   * 获取一个作者在某个周期范围内的收益详情
   * @param {Number|String} begin_period
   * @param {Number|String} end_period
   * @param {Number|String} poster
   * @returns {Promise<any>}
   */
  getPosterProfit({
    begin_period,
    end_period,
    poster
  }) {
    return this.proxy('db_api', 'get_post_profits_detail', [begin_period, end_period, platform, poster]);
  }

  /**
   * 获取一个平台在某个周期范围内的收益详情
   * @param {Number|String} begin_period
   * @param {Number|String} end_period
   * @param {Number|String} platform
   * @returns {Promise<any>}
   */
  getPlatformProfit({
    begin_period,
    end_period,
    platform
  }) {
    return this.proxy('db_api', 'get_platform_profits_detail', [begin_period, end_period, platform]);
  }

  /**
   * 获取一个账户在某个周期的打分收益总数
   * @param {Number|String} account
   * @param {Number|String} period
   * @returns {Promise<any>}
   */
  getScoreProfit({
    account,
    period
  }) {
    return this.proxy('db_api', 'get_score_profit', [account, period]);
  }

  /**
   * 账户给文章打分
   * @param {Number|String} from_account 打分人
   * @param {Number|String} platform 平台
   * @param {Number|String} poster 文章作者
   * @param {Number|String} pid 文章的pid
   * @param {Number|String} score 分数
   * @param {Number|String} csaf 投入积分数
   */
  scoreCreate({
    from_account,
    platform,
    poster,
    pid,
    score,
    csaf
  }) {
    return new Promise((resolve, reject) => {
      let op_data = {
        from_account_uid: from_account,
        platform: platform,
        poster: poster,
        post_pid: pid,
        score: score,
        csaf: csaf,
        sign_platform: config.platform_id,
      };

      let tr = new TransactionBuilder();
      tr.add_type_operation('score_create', op_data);
      tr.set_required_fees(op_data.from_account_uid, false, true).then(() => {
        tr.add_signer(PrivateKey.fromWif(config.secondary_key));
        this.__broadCast(tr).then(res => resolve(res)).catch(err => reject(err));
      }).catch(e => {
        reject({
          code: 2000,
          message: e.message
        });
      });
    });
  }


  /**
   * 平台代理用户打赏 - 只能操作用户的零钱
   * @param {Number|String} from_account   打分人
   * @param {Number|String} platform       平台
   * @param {Number|String} poster         文章作者
   * @param {Number|String} pid            文章的pid
   * @param {Number|String} amount         打赏数量
   */
  rewardProxy({
    from_account,
    platform,
    poster,
    pid,
    amount
  }) {
    return new Promise((resolve, reject) => {
      let op_data = {
        from_account_uid: from_account,
        platform: platform,
        poster: poster,
        post_pid: pid,
        amount: amount,
        sign_platform: config.platform_id,
      };

      let tr = new TransactionBuilder();
      tr.add_type_operation('reward_proxy', op_data);
      tr.set_required_fees(op_data.from_account_uid, false, true).then(() => {
        tr.add_signer(PrivateKey.fromWif(config.secondary_key));
        this.__broadCast(tr).then(res => resolve(res)).catch(err => reject(err));
      }).catch(e => {
        reject({
          code: 2000,
          message: e.message
        });
      });
    });
  }

  /**
   * 查询某个账户给某篇文章打分
   * @param {Number|String} platform 平台
   * @param {Number|String} poster 文章作者
   * @param {Number|String} pid 文章的pid
   * @param {Number|String} from_account 打分人
   */
  getPostScore({
    platform,
    poster,
    pid,
    from_account
  }) {
    return this.proxy('db_api', 'get_score', [platform, poster, pid, from_account])
  }

  /**
   * 查询某个账户给某篇文章打分
   * @param {Number|String} platform 平台
   * @param {Number|String} poster 文章作者
   * @param {Number|String} pid 文章的pid
   * @param {Number|String} limit 打分人
   * @param {String} lower_bound_score 其实点赞id
   * @param {Boolean} list_cur_period 仅列出当前周期
   */
  listPostScores({
    platform,
    poster,
    pid,
    limit,
    list_cur_period,
    lower_bound_score
  }) {
    lower_bound_score = lower_bound_score || '0.0.0'; // 起始点赞的id
    return this.proxy('db_api', 'list_scores', [platform, poster, pid, lower_bound_score, limit, list_cur_period])
  }

  /**
   * 统一广播处理
   * @param {TransactionBuilder} tr 
   */
  __broadCast(tr) {
    return new Promise((resolve, reject) => {

      let common_return = trx => {
        return {
          block_num: trx.head_block_number(),
          txid: trx.id()
        };
      }

      return tr.broadcast(() => resolve(common_return(tr)))
        .then(() => resolve(common_return(tr)))
        .catch(e => {
          if (e.message && e.message.indexOf('Insufficient Prepaid') >= 0)
            e = {
              code: 2005,
              message: '零钱不足'
            }
          reject(e);
        });
    })
  }

  /**
   * 代理链上接口
   * @param module 接口所属模块(db,network,history,crypto,orders)
   * @param method 具体方法
   * @param params 参数
   * @param cb     返回数据的预处理函数
   * @returns {Promise<any>}
   */
  proxy(module, method, params, cb = null) {
    return new Promise((resolve, reject) => {
      Apis.instance()[module]()
        .exec(method, params)
        .then(rsp => {
          resolve(rsp);
          typeof cb === 'function' ?
            resolve(cb(rsp)) : resolve(rsp);
        })
        .catch(reason => {
          reject(reason);
        });
    })
  }
}

module.exports = new Api();