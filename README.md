# yoyow-middleware

使用 YOYOW 中间件是平台接入最简单的方式。主要提供三方面的接口： 账号授权，平台激励和内容上链。 可以采用 Docker 一键部署，获得相应的 API，方便的与 YOYOW 链进行交互。

YOYOW 中间件是通过 YOYOW node 的 API 接口与 YOYOW 网络通讯，为平台服务商提供方便的访问链上数据的接口，保证传统业务代码能在只做尽量少的改动情况下，也能达到上链的要求。具体示意图如下：
![YOYOW 中间件作用示意图](https://github.com/yoyow-org/yoyow-middleware/blob/master/public/images/architecture.png)

平台的创建操作步骤请参考：[从 0 开始创建 YOYOW 平台账户](https://wiki.yoyow.org/zh/latest/others/create_platform.html)

## 部署启动

### 配置文件说明

配置文件的路径在代码路径下`conf/config.js` 文件中，如果使用 docker 的方式启动，可以将配置文件映射到容器中`/app/conf`路径下

```javascript
{
    // api服务器地址，测试网公共api地址如下，正式网部署请更改该地址,例如正式网公共的api地址：wss://api-bj.yoyow.org/ws
    apiServer: "wss://api.testnet.yoyow.org",

    // 安全请求有效时间，单位s，如果请求的内容超过有效期，会返回 1003 请求已过期
    secure_ageing: 60,

    // 平台安全请求验证key 可以自行定义，具体使用见《安全访问》
    secure_key: "",

    // 平台所有者资金私钥
    active_key: "",

    // 平台所有者零钱私钥
    secondary_key: "",

    // 平台所有者备注私钥
    memo_key: "",

    // 平台id(yoyow id)
    platform_id: "",

    // 操作手续费是否使用积分
    use_csaf: true,

    // 转账是否转到余额 否则转到零钱
    to_balance: false,

    // 钱包授权页URL，测试网地址如下，正式网地址“https://wallet.yoyow.org/#/authorize-service”
    wallet_url: "http://demo.yoyow.org:8000/#/authorize-service"
}
```

需要注意的是：

1. 在一般使用场景中，中间件值最多需要动用零钱私钥和备注私钥，只配置零钱私钥和备注私钥可以满足大部分需求。除非你确定需要使用资金私钥，否则不要将资金私钥写进配置文件。
2. 中间件中使用了加密请求(`secure_key`)来保证安全性，不过依然强烈建议内网部署，做好隔离，也需要保证私钥的安全性。
3. 操作手续费建议使用积分抵扣，如果抵扣失败，会直接报错，不会自动扣除零钱作为手续费

### Docker 一键部署

```bash
docker run -itd --name yoyow-middleware -v <本地配置文件路径>:/app/conf -p 3001:3001 yoyoworg/yoyow-middleware
```

### 手动部署

1. clone 源码
   `git clone https://github.com/yoyow-org/yoyow-middleware.git`
2. 修改中间件配置
   参照配置文件说明()，修改文件`yoyow-middleware/conf/config.js`
3. 安装中间件服务所需 node 库
   进入 `~/yoyow-middleware/` 目录
   `npm install`
4. 启动中间件服务
   `npm start`

启动正常情况如下图
![启动正常情况如图](https://github.com/yoyow-org/yoyow-middleware/blob/master/public/images/step4.png)

## V2 接口说明

### 请求文档及示例

#### 1. 基础查询接口

##### 1.1. 获取指定账户信息 /accounts

请求类型：GET

请求路径：/accounts/:uid

    {Number} uid - 账号id

请求参数：

    无

请求示例：

    localhost:3000/api/v2/accounts/30833

返回结果：

```
    {
      code: 操作结果,
      message: 返回消息,
      data: { // 用户信息
        id: 账号Object Id
        uid: 账号uid
        name: 账号名称
        owner: 主控权限
        active: 资金权限
        secondary: 零钱权限
        memo_key: 备注密钥公钥
        reg_info: 注册信息
        can_post: 是否可发帖
        can_reply: 是否可回帖
        can_rate: 是否可评价
        is_full_member: 是否会员
        is_registrar: 是否注册商
        is_admin: 是否管理员
        statistics: { //用户YOYO资产详情
          obj_id: 资产对象id
          core_balance: 余额
          prepaid: 零钱
          csaf: 积分
          total_witness_pledge: 见证人总抵押（用户创建见证人抵押数量）
          total_committee_member_pledge: 理事会总抵押（用户创建理事会成员抵押数量）
          total_platform_pledge: 平台总抵押（用户创建平台抵押数量）
          releasing_witness_pledge: 见证人抵押待退回
          releasing_committee_member_pledge: 理事会抵押待退回
          releasing_platform_pledge: 平台抵押待退回
        }
        assets: [ //用户拥有的所有资产
            {
                amount: 资产数量,
                asset_id: 资产id,
                precision: 资产精度,
                symbol: 资产符号,
                description: 资产描述"
            }
            ...
        ]
      }
    }
```

##### 1.2. 获取指定账户近期活动记录 /accounts/:uid/histories

请求类型：GET

请求路径：/accounts/:uid/histories

    {Number} uid - 账号id

请求参数：

    {Number} op_type - 查询 op 类型 '0' 为 转账 op，默认为 null 即查询所有 OP 类型
    {Number} start 查询开始编号，为 0 时则从最新记录开始查询，默认为 0
    {Number} limit - 查询长度，最大不可超过 100 条，默认为 10

请求示例：

`localhost:3000/api/v2/accounts/30833/histories?start=0&limit=2&op_type=0`

返回结果：

```
    {
      code: 操作结果,
      message: 返回消息,
      data: [] 历史记录对象数组
    }
```

##### 1.3. 查询账户授予平台的权限

请求类型：GET

请求路径：/authPermissions

请求参数：

    {Number} platform - 平台账户
    {Number} account - 起始查询账户

请求示例：

    localhost:3000/api/v2/authPermissions?platform=33313&account=31479

返回结果：

```
    {
      code: 操作结果,
      message: 返回消息,
      data: [
        {
            "id": "2.22.0",
            "account": 30833, 账号id
            "platform": 33313, 平台id
            "max_limit": 1000000000, 授予平台可使用的最大零钱额度
            "cur_used": 0,  当前已使用零钱数额
            "is_active": true,  授权状态，false 则为该授权无效
            "permission_flags": 255  详细授权权限
        }
    ]
    }
```

##### 1.4. 获取指定资产信息

请求类型：GET

请求路径：/assets/YOYO

请求参数：

```
{String | Number} search - 资产符号（大写）或 资产id
```

请求示例：

```
http://localhost:3001/api/v2/assets/YOYO
```

返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: {
    "id":"1.3.0", - 资产object id
    "asset_id":0, - 资产id
    "symbol":"YOYO", - 资产符号
    "precision":5, - 资产精度
    "issuer":1264, - 资产发行者uid
    "options":{
      "max_supply":"200000000000000", - 流通量上限
      "market_fee_percent":0, - 交易手续费百分比
      "max_market_fee":"1000000000000000", - 交易手续费最大值
      "issuer_permissions":0, - 资产可用权限
      "flags":0, - 资产权限
      "whitelist_authorities":[], - 资产白名单管理员清单
      "blacklist_authorities":[], - 资产黑名单管理员清单
      "whitelist_markets":[], - 交易对白名单
      "blacklist_markets":[], - 交易对黑名单
      "description":"" - 资产描述
    },
    "dynamic_asset_data_id":"2.2.0", - 资产动态object id
    "dynamic_asset_data":{
      "id":"2.2.0", - 资产动态object id
      "asset_id":0,
      "current_supply":"107384564466939", - 资产当前发行量
      "accumulated_fees":0
    },
    "current_supply":"107384564466939",  - 资产当前发行量
    "accumulated_fees":0
  }
}

```

##### 1.5. 获取块详细信息

请求类型：GET

请求路径：/blocks/:block_num

请求参数：

```
​{Number} block_num - 块高度（块号）
```

请求示例：

```
http://localhost:3001/api/v2/blocks/100
```

返回结果：

```
{
        "previous": "000000630ad27ed2acab3af49cf6e6ac7a8f0c39",
        "timestamp": "2019-06-11T11:37:57",
        "witness": 25997,
        "transaction_merkle_root": "0000000000000000000000000000000000000000",
        "witness_signature": "1f2e29ec9b44ead78ffae6ab8f8e11a5d9beab6064146b21f96f8e43b07eb88c741c87140270bd57ea9efd8fe9327adb53fe2aae5f583c848b87f76648886660c9",
        "transactions": [], - 块中 包含的所有交易
        "block_id": "00000064742ada3ddd9efc1c8bf35f28757fa150",
        "signing_key": "YYW587fGuqZXBiXUsoKdwb73RP1WE7AHNgXF5kZ7vSueq7gp6WXGk",
        "transaction_ids": []
    }
```

##### 1.6. 获取块状态（是否不可逆）

请求类型：GET

请求路径：/blocks/:block_num/confirmed

请求参数：

​ {Number} block_num - 验证的块高度（块号）

请求示例：

```
http://localhost:3001/api/v2/blocks/100/confirmed
```

返回结果：

```
    {
      code: 操作结果,
      message: 返回消息,
      data: 此块是否不可退回
    }
```

####

#### 2. 文章相关接口

##### 2.1. 查询文章

请求类型：GET

请求路径：/posts

请求参数：

```
​{Number} platform - 平台账户 id
​{Number} poster - 发文账户 id
​{Number} post_pid - 文章的 pid
```

```
localhost:3000/api/v2/posts?poster=30833&post_pid=2&platform=33313
```

返回结果：

```
{
  "id": "1.7.1",  - 文章Object id
  "platform": 33313, - 平台 id
  "poster": 30833, - 发文账号 id
  "post_pid": 2, - 文章 pid
  "origin_poster": 30833, - 转发原文 的 发文账号 id
  "origin_post_pid": 1, - 转发原文 的 文章pid
  "origin_platform": 33313, - 转发原文所在的平台账户id
  "hash_value": "945456321", - 文章hash
  "extra_data": "coammentextry", - 文章扩展信息
  "title": "commentname", - 文章标题
  "body": "commentbody", - 文章正文
  "create_time": "2019-07-01T13:49:33", - 创建时间
  "last_update_time": "2019-07-01T13:49:33", - 最后一次修改时间
  "receiptors": [  - 受益人列表
      [
          30833,
          {
              "cur_ratio": 7500, - 所占受益比例
              "to_buyout": false, - 是否出售受益比例
              "buyout_ratio": 0, - 出售受益比例
              "buyout_price": 0, - 出售价格
              "buyout_expiration": "1969-12-31T23:59:59" - 出售过期时间
          }
      ],
      [
          33313,
          {
              "cur_ratio": 2500,
              "to_buyout": false,
              "buyout_ratio": 0,
              "buyout_price": 0,
              "buyout_expiration": "1969-12-31T23:59:59"
          }
      ]
  ],
  "license_lid": 1, # 版权license id
  "permission_flags": 255, # 文章权限
  "score_settlement": false # 文章是否已经参与过打分收益的分发
}
```

##### 2.2. 简单的发文章接口

该接口为精简接口，可以满足简单的发文需求
只支持发原创文章，文章 post_type 为 0
文章的受益权采取默认值，25%受益权归属平台，75%归属作者
文章的权限采用默认值，允许评论，允许打分，允许打赏，允许转发，允许出售收益
文章的转发价格为空，即实际上不允许转发。

请求类型：POST

请求路径：/posts/simple

    {Object} cipher - 请求对象密文对象

    {
      ct, - 密文文本 16进制
      iv, - 向量 16进制
      s   - salt 16进制
    }

请求对象结构:

    {Number} platform - 平台账号
    {Number} poster - 发文人账号
    {String} title - 文章标题
    {String} body - 文章内容
    {String} url - 文章原文的链接（会呈现在链上文章的 extra_data 中）
    {String} hash_value - hash值，如果不提供该参数，默认使用body内容的sha256值。
    {Number} license_lid - License ID
    {Number} time - 操作时间

请求示例：参照 安全请求验证

```
http://localhost:3001/api/v2/posts/simple
```

返回结果：

```
{
  "block_num": 858010, - 交易广播时的引用块号
  "txid": "10fdf2976789fb876c0ca7417abd74a6eecd8564", - 交易 id
  "post": { - 文章详情
      "platform": "33313",
      "poster": "30833",
      "post_pid": 6,
      "hash_value": "79f0f1c9f5d2cb0762407dc77b92626bb970c14288c7e789552c7e840bf94b0f",
      "extra_data": "{\"url\":\"https://www.biask.com/\"}",
      "title": "title:YOYOW发布主网2.0源代码",
      "body": "",
      "extensions": {
          "post_type": 0,
          "license_lid": "1",
          "permission_flags": 255,
          "sign_platform": "33313"
      },
      "fee": {
          "total": {
              "amount": 0,
              "asset_id": 0
          }
      }
  }
}
```

##### 2.3. 发文章

请求类型：POST

请求路径：/posts/simple

    {Object} cipher - 请求对象密文对象

    {
      ct, - 密文文本 16进制
      iv, - 向量 16进制
      s   - salt 16进制
    }

请求对象结构:

    {Number} platform - 平台账号
    {Number} poster - 发文人账号
    {String} title - 文章标题
    {String} body - 文章内容
    {String} url - 文章原文的链接（会呈现在链上文章的 extra_data 中）
    {String} hash_value - hash值，如果不提供该参数，默认使用body内容的sha256值。
    {Object} extensions - 文章的扩展属性, 参考下文
    {Number} origin_platform -  原文章的平台id
    {Number} origin_poster - 原文章的作者id
    {Number} origin_post_pid - 原文章的pid
    {Number} time - 操作时间

文章扩展属性结构：

```javascript
{
"post_type": 0,  // 文章类型 0-原创文章， 1- 评论文章（需要指定原文的平台作者和pid信息）， 2- 转发文章（需要指定原文的平台作者和pid信息）
// "forward_price": null,  // 设置转发价格，可选项，不填写则实际不会允许转发
"receiptors": [[ // 文章受益人列表 最多不超过5个人，可选项，不填写则 25%受益权归属平台，75%归属作者
    271617537,{
      "cur_ratio": 2500, // 平台必须占有 25% 的文章受益权
      "to_buyout": false,
      "buyout_ratio": 0,
      "buyout_price": 0,
      "buyout_expiration": 0
    }
  ],[
    291774116,{
      "cur_ratio": 6000,  // 作者占有60%的受益权。（作者至少占有25%的文章受益权，其他的可以出售）
      "to_buyout": true,  // 是否出售受益权
      "buyout_ratio": 3000, // 出售 30%的受益权
      "buyout_price": 3000000,  // 出售价格 30 个YOYO（注意精度）
      "buyout_expiration": 1564999949 // 出售挂单的过期时间，值为时间戳，会转换成utc时间。
    }
  ],[
    337250355,{
      "cur_ratio": 1500,
      "to_buyout": false,
      "buyout_ratio": 0,
      "buyout_price": 0,
      "buyout_expiration": 0
    }
  ]
],
"license_lid": 1,  // license_id 必须指定
"permission_flags": 255 // 文章的权限标记值，必须指定，参考官方文档中的相关介绍
}
```

请求示例：参照 仓库中 test/examples/create_post_example.js

```
http://localhost:3001/api/v2/posts
```

返回结果：

```
{
  "block_num": 858010, - 交易广播时的引用块号
  "txid": "10fdf2976789fb876c0ca7417abd74a6eecd8564", - 交易 id
  "post": { - 文章详情
      "platform": "33313",
      "poster": "30833",
      "post_pid": 6,
      "hash_value": "79f0f1c9f5d2cb0762407dc77b92626bb970c14288c7e789552c7e840bf94b0f",
      "extra_data": "{\"url\":\"https://www.biask.com/\"}",
      "title": "title:YOYOW发布主网2.0源代码",
      "body": "",
      "extensions": {
          "post_type": 0,
          "license_lid": "1",
          "permission_flags": 255,
          "sign_platform": "33313"
      },
      "fee": {
          "total": {
              "amount": 0,
              "asset_id": 0
          }
      }
  }
}
```

##### 2.4. 为文章打分

平台可以使用授权账户的权限，代理账户为文章打分。

请求类型：POST

请求路径：/posts/score

请求参数：

```
{Object} cipher - 请求对象密文对象

{
  ct, - 密文文本 16进制
  iv, - 向量 16进制
  s   - salt 16进制
}
```

请求对象结构:

```
    {Number} from_account - 打分的账户
    {Number} platform - 平台账号
    {Number} poster - 发文人账号
    {String} pid - 文章pid
    {Number} score - 打分 分值，范围是[-5, 5]
    {Number} csaf - 打分使用的积分数量
    {Number} time - 操作时间
```

请求示例：参照 安全请求验证

```
localhost:3000/api/v2/posts/score
```

返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: {
    block_num: 操作所属块号
    txid: 操作id
  }
}

```

##### 2.5. 为文章打赏

平台可以代理普通账户打赏其他文章。

打赏会动用账户的零钱，也会消耗账户授予授予平台的零钱额度

请求类型：POST

请求路径：/posts/reward-proxy

请求参数：

```
{Object} cipher - 请求对象密文对象

{
  ct, - 密文文本 16进制
  iv, - 向量 16进制
  s   - salt 16进制
}
```

请求对象结构:

```
    {Number} from_account - 打分的账户
    {Number} platform - 平台账号
    {Number} poster - 发文人账号
    {String} pid - 文章pid
    {Number} amount - 打分 分值，范围是[-5, 5]
    {Number} csaf - 打分使用的积分数量
    {Number} time - 操作时间
```

请求示例：参照 安全请求验证

```
localhost:3000/api/v2/posts/reward-proxy
```

返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: {
    block_num: 操作所属块号
    txid: 操作id
  }
}
```

##### 2.6. 获取文章列表

请求类型：GET

请求路径：/posts/getPostList

请求参数：

```
{Number} platform - 平台账号
{Number} poster -发文者账号（默认null，为null时查询该平台所有文章）
{Number} limit - 加载数（默认20）
{String} start - 开始时间 'yyyy-MM-ddThh:mm:ss' ISOString （加载下一页时将当前加载出的数据的最后一条的create_time传入，不传则为从头加载）
```

请求示例：

    http://localhost:3001/api/v2/posts/getPostList?start=2019-07-11T07:04:37&limit=2&poster=30834

返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: [文章对象（参考获取单个文章返回的数据结构）]
}
```

##### 2.7 获取某文章的打分列表

请求类型：GET

请求路径：/posts/listScores

请求参数：

```
{Number} platform - 平台账号
{Number} poster -发文者账号
{Number} pid - 文章的pid
{Number} lower_bound_score - 起始的打分的object id， 默认为 "0.0.0"
{Number} limit - 返回结果的最大数量
{Boolean} list_cur_period - 是否只取当前评奖周期的数据，默认为true
```

请求示例：

    http://localhost:3001/api/v2/posts/listScores?platform=33313&poster=30833&pid=2&lower_bound_score=2.16.3&limit=10&list_cur_period=true

返回结果：

```
{
    "code": 0,
    "data": [ // 打分记录
        {
            "id": "2.16.3", // 打分的Object id
            "from_account_uid": 31479, // 打分人
            "platform": 33313,
            "poster": 30833,
            "post_pid": 2,
            "score": 5,
            "csaf": 23333,
            "period_sequence": 0,   // 打分所在周期数
            "profits": 0,  // 打分获得的收益
            "create_time": "2019-07-07T07:40:45"
        }
    ],
    "message": "操作成功"
}
```

#### 3. @TODO 广告 相关

##### 3.1 发布广告位

请求类型：POST

请求路径：/advertisings

    {Object} cipher - 请求对象密文对象

    {
      ct, - 密文文本 16进制
      iv, - 向量 16进制
      s   - salt 16进制
    }

请求对象结构:

    {Number} platform - 平台账号
    {String} description - 广告位描述
    {Number} unit_price - 单位时间价格
    {Number} unit_time - 单位时间

请求示例：参照 安全请求验证

```
http://localhost:3001/api/v2/advertisings
```

返回结果：

```
{ code: 0,
  data: {
    block_num: 2671695, -交易广播时引用的块号
    txid: 'eca38133036dfa8a1bbcdfe55b08e01343692f2d', - 交易ID
    advertising: {
      platform: 271617537,
      description: 'VVVVV',
      unit_price: 100,
      unit_time: 86400,
      advertising_aid: 13, -广告id
      fee: {
        "total": {
          "amount": 0,
          "asset_id": 0
        }
      }
    }
  },
  message: '操作成功'
}
```

##### 3.2 更新广告位

请求类型：POST

请求路径：/advertising/update
{Object} cipher - 请求对象密文对象

{
ct, - 密文文本 16 进制
iv, - 向量 16 进制
s - salt 16 进制
}

请求对象结构:

    {Number} platform - 平台账号
    {String} advertising_aid - 广告id
    {String} description - 广告位描述
    {Number} unit_price - 单位时间价格
    {Number} unit_time - 单位时间
    {Boolean} on_sell - 出售状态

请求示例：

    localhost:3000/api/v2/advertising/update

返回结果：

```
{
	code: 0,
	data: {
		block_num: 2671971,
		txid: 'f7e4b1afb19c210035da3e9a71abdf0d0217bac5',
		advertising: {
			platform: 271617537,
			advertising_aid: 3,
			description: 'CCCCCCC',
			fee: {
        "total": {
          "amount": 0,
          "asset_id": 0
        }
      }
		}
	},
	message: '操作成功'
}
```

##### 3.3 @TODO 购买广告位

请求类型：POST

请求路径：/advertising/buy
{Object} cipher - 请求对象密文对象

{
ct, - 密文文本 16 进制
iv, - 向量 16 进制
s - salt 16 进制
}

请求对象结构:

    {Number} account - 账户的id或名字
    {Number} platform - 平台账号
    {String} advertising_aid - 广告id
    {Number} start_time - 开始时间
    {Number} buy_number - 购买数目
    {String} extra_data - 额外信息
    {String} memo - 备注信息

请求示例：

    localhost:3000/api/v2/advertising/buy

返回结果：

```
{
  code: 0,
  data: {
    block_num: 2672816,
    txid: 'bf15ce8d17fd411088f31a8c3f15e6f7ca6525c9',
    advertising: {
      platform: 271617537,
      advertising_aid: 3,
      advertising_order_oid: 3,
      isconfirm: true,
      fee: {
        "total": {
          "amount": 0,
          "asset_id": 0
        }
      }
    }
  },
  message: '操作成功'
}
```

##### 3.4 确认广告位订单

请求类型：POST

请求路径：/advertising/confirm

{Object} cipher - 请求对象密文对象

{
ct, - 密文文本 16 进制
iv, - 向量 16 进制
s - salt 16 进制
}

请求对象结构:

    {Number} platform - 平台账号
    {String} advertising_aid - 广告id
    {Number} advertising_order_oid - 广告位订单的id
    {Boolean} isconfirm - 确认或拒绝广告位订单

请求示例：

    localhost:3000/api/v2/advertising/confirm

返回结果：

```
{
  code: 0,
  data: {
    block_num: 2672816,
    txid: 'bf15ce8d17fd411088f31a8c3f15e6f7ca6525c9',
    advertising: {
      platform: 271617537,
      advertising_aid: 3,
      advertising_order_oid: 3,
      isconfirm: true,
      fee: {
        "total": {
          "amount": 0,
          "asset_id": 0
        }
      }
    }
  },
  message: '操作成功'
}
```

##### 3.5 @TODO 赎回广告位订单

请求类型：POST

请求路径：/advertising/ransom
{Object} cipher - 请求对象密文对象

{
ct, - 密文文本 16 进制
iv, - 向量 16 进制
s - salt 16 进制
}

请求对象结构:

    {Number} from_account - 用户的id或名字
    {Number} platform - 平台账号
    {String} advertising_aid - 广告id
    {Number} advertising_order_oid - 广告位订单的id

请求示例：

    localhost:3000/api/v2/advertising/ransom

返回结果：

```
{
}
```

##### 3.6 获取平台广告列表

请求类型：GET

请求路径：/advertisings

请求对象结构:

    {Number} platform - 平台账号
    {Number} lower_bound_advertising - 起始广告位id
    {Number} limit - 长度

请求示例：

    localhost:3000/api/v2/advertisings?platform=xxx&lower_bound_advertising=0&limit=100

返回结果：

```
{
  "code": 0,
  "data": [{
    "id": "2.18.0",
    "advertising_aid": 1,
    "platform": 271617537,
    "on_sell": true,
    "unit_time": 86400,
    "unit_price": 5000000,
    "description": "update_first_ad",
    "last_order_sequence": 2,
    "publish_time": "2019-10-12T03:52:12",
    "last_update_time": "2019-10-12T03:53:21"
  }],
  "message": "操作成功"
}
```

##### 3.7 获取广告位订单

请求类型：GET

请求路径：/advertising_orders

请求对象结构:

    {Number} filter - 0代表根据购买方id查询 1代表根据平台和广告id查询
    {Number} purchaser - 购买方id（filter为0时必传）
    {Number} platform - 平台账号（filter为1时必传）
    {Number} advertising_aid_type - 广告位id（filter为1时必传）
    {Number} lower_bound_advertising_order - 起始广告位id
    {Number} limit - 长度

请求示例：

    localhost:3000/api/v2/advertising_orders?filter=0&purchaser=xxx&lower_bound_advertising_order=0&limit=100

    localhost:3000/api/v2/advertising_orders?filter=1&platform=xxx&advertising_aid_type=1&lower_bound_advertiing_order=0&limit=100

返回结果：

```
{
  "code": 0,
  "data": [{
    "id": "2.19.0",
    "advertising_order_oid": 1,
    "platform": 271617537,
    "advertising_aid": 1,
    "user": 291774116,
    "released_balance": 5000000,
    "start_time": "2019-10-12T04:21:40",
    "end_time": "2019-10-13T04:21:40",
    "buy_request_time": "2019-10-12T04:20:57",
    "status": "advertising_accepted",
    "handle_time": "2019-10-12T04:21:36",
    "memo": {
      "from": "YYW6x1HQBQEuUB1JXx1X6WstGWgLJu5Krg46SqJguRPpnEMTV39tp",
      "to": "YYW7Jajj5qMSZVeWj4swUUvgKrU5pkHSg9iCUFCQ4iSDuoE87ucoT",
      "nonce": "2307413863269517774",
      "message": "3e81b5ded1220586803423ec546bea13"
    },
    "extra_data": "extramessage"
  }],
  "message": "操作成功"
}

```

##### 3.7 @TODO 查询账户授予平台的权限

请求类型：GET

请求路径：/advertising

请求参数：

    {Number} platform - 平台账户
    {String} lower_bound_advertising - 起始广告的id
    {Number} limit - 返回结果数

请求示例：

    localhost:3000/api/v2/advertising?platform=33136&lower_bound_advertising=0.0.0&limit=100

返回结果：

```
{
}
```

#### 4. 其他交易

##### 4.1. 转账

请求类型：POST

请求路径：/transfer

请求参数：

```
 {Object} cipher - 请求的密文对象，格式如下
{
  ct, - 密文文本 16进制
  iv, - 向量 16进制
  s   - salt 16进制
}
```

请求对象结构:

```
{Number} uid - 指定用户id
{Number} amount - 转出金额
{Number} asset_id - 资产id
{string} memo - 备注
{Number} time - 操作时间
```

请求示例：参照 安全请求验证

```
localhost:3000/api/v2/transfer
```

返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: {
    block_num: 操作所属块号
    txid: 操作id
  }
}
```

#### 5. Auth 相关

##### 5.1. 签名平台 sign

请求类型：GET

请求参数：无

请求示例：

    localhost:3000/auth/sign

返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: {
    sign: 签名结果,
    time: 操作时间(毫秒值),
    platform: 平台所有人id,
    url: 钱包授权url
  }
}
```

##### 5.2 签名验证 verify

请求类型：GET

请求参数：

    {Number} yoyow - 账号id
    {Number} time - 操作时间毫秒值
    {String} sign - 签名结果

请求示例：

    localhost:3000/auth/verify?sign=20724e65c0d763a0cc99436ab79b95c02fbb3f352e3f9f749716b6dac84c1dc27e5e34ff8f0499ba7d94f1d14098c6a60f21f2a24a1597791d8f7dda47559c39a0&time=1517534429858&yoyow=217895094

返回结果：

    {
      code: 操作结果,
      message: 返回消息,
      data: {
        verify: 签名是否成功,
        name: 签名的yoyow用户名
      }
    }

##### 5.3 签名平台 返回二维码 signQR

请求类型：GET

请求参数：

    {String} state - 拓展信息，将在调用平台登录接口时与用户签名信息一同发送到平台，用于平台登陆接口需要自定义的参数时使用，若无此需求可不传

请求示例：

    localhost:3000/auth/signQR?state=platformCustomParams

返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: 二维码图片base64 字符串
}
```

##### 5.4 平台拓展信息协议说明

平台属性 extra_data 拓展信息 JSON 对象格式字符串 中

```javascript
{
    "login":"http://example/login" //平台扫码登录请求接口
    "description":"平台说明"  //平台描述
    "image":"http://example.image.jpg" //平台头像，yoyow app 1.1 中，显示的平台头像
    "h5url":"http://exampleH5.com" //平台h5地址，用于在无app可跳转动情况下，跳转到h5页面
    "packagename":"com.example.app" //平台android 跳转
    "urlscheme":"example://"  //平台ios跳转
}
```

##### 5.5 平台扫码登录

App 扫码授权登录将访问 平台拓展信息的 平台扫码登录请求接口 ，发送回用户签名对象

```
{
  {Number} yoyow - 当前操作用户账号id
  {String} time - 签名时间戳字符串
  {String} sign - 签名字符串
  {String} state - 平台签名时传入的自定义信息 (参考 Auth 相关 4.3 - signQR)
}
```

约定 平台提供的接口必须返回以下信息

```
{
  {Number} code - 操作结果 0 为通过 任何非 0 情况视为错误处理
  {String} message - 操作结果描述
}
```

### 请求返回 error code 状态说明

```
1001 无效的签名类型

1002 无效的签名时间

1003 请求已过期

1004 无效的操作时间

1005 无效的操作签名

1006 账号信息与链上不匹配（常见于私钥恢复之后，使用其他电脑的本地数据或旧的备份文件进行授权操作导致）

1007 未授权该平台

2000 api底层异常

2001 账号不存在

2002 无效的账号

2003 无效的转账金额

2004 零钱和积分不足支付操作手续费

2005 零钱不足

2006 无效的资产符号或id

2008 无效的备注私钥

2010 打分失败

2011 转发失败

2012 打赏失败

3001 文章ID必须为该平台该发文人的上一篇文章ID +1（平台管理发文id）
```

### 安全请求验证

涉及到资金安全相关的操作，比如转账，发文等各种写操作，会在中间件服务中验证其有效性。这类请求的信息需要先通过加密操作转换成密文，再发送给中间件服务。加密方式采用对称加密 AES，密钥为配置文件中的`secure_key`。

加密示例(javascript 的 crypto-js 版，其他语言使用类似的 AES 加密方式)

默认 mode CBC , padding scheme Pkcs7

例如：transfer 操作

```javascript
let key = 'customkey123456' // 此key与中间件中的config 里 secure_key相同

let sendObj = {
  uid: 9638251,
  amount: 100,
  memo: 'hello yoyow',
  time: Date.now() //time 字段 操作时间取当前时间毫秒值 加密操作须带有此字段 用于验证操作时效
}

let cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key)

$.ajax({
  url: 'localhost:3000/api/v2/transfer',
  type: 'POST',
  data: {
    ct: cipher.ciphertext.toString(CryptoJS.enc.Hex),
    iv: cipher.iv.toString(),
    s: cipher.salt.toString()
  },
  success: function(res) {
    // do something ...
  }
})
```

PHP 加密方式

```php
    function cryptoJsAesEncrypt($passphrase, $value){
      $salt = openssl_random_pseudo_bytes(8);
      $salted = '';
      $dx = '';
      while (strlen($salted) < 48) {
          $dx = md5($dx.$passphrase.$salt, true);
          $salted .= $dx;
      }
      $key = substr($salted, 0, 32);
      $iv  = substr($salted, 32,16);
      $encrypted_data = openssl_encrypt($value, 'aes-256-cbc', $key, true, $iv);
      $data = array("ct" => bin2hex($encrypted_data), "iv" => bin2hex($iv), "s" => bin2hex($salt));
      return json_encode($data);
    }
```

其他需要安全请求验证的操作根据文档改动 sendObj
