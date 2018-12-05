# yoyow-middleware

使用YOYOW 中间件是平台接入最简单的方式。主要提供三方面的接口： 账号授权，平台激励和内容上链。 可以采用 Docker 一键部署，获得相应的 API，方便的与 YOYOW 链进行交互。

## 部署启动
### 配置文件说明

配置文件的路径在代码路径下`conf/config.js` 文件中，如果使用docker的方式启动，可以将配置文件映射到容器中`/app/conf`路径下

```json
{
    // api服务器地址，测试网公共api地址如下，正式网部署请更改该地址
    apiServer: "ws://47.52.155.181:10011",
    
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
    wallet_url: "http://demo.yoyow.org:8000/#/authorize-service",
    
    // 允许接入的IP列表，强制指定明确的来访IP地址，暂不支持"*" 或 "0.0.0.0"
    allow_ip: ["localhost", "127.0.0.1"]
}
```
需要注意的是：

1. 在一般使用场景中，中间件值最多需要动用零钱私钥和备注私钥，只配置零钱私钥和备注私钥可以满足大部分需求。除非你确定需要使用资金私钥，否则不要将资金私钥写进配置文件。
2. 中间件中使用了限制IP(`allow_ip`)和加密请求(`secure_key`)两种方式来保证安全性，不过依然强烈建议内网部署，做好隔离，私钥的安全性较为重要。
3. 操作手续费建议使用积分抵扣，如果抵扣失败，会直接报错，不会自动扣除零钱作为手续费

### Docker 一键部署

```bash
docker run -itd --name yoyow-middleware -v <本地配置文件路径>:/app/conf -p 3001:3001 yoyoworg/yoyow-middleware
```

### 手动部署
1. clone 源码
  `git clone git@github.com:yoyow-org/yoyow-node-sdk.git`
2. 修改中间件配置 
  参照配置文件说明()，修改文件`yoyow-node-sdk/middleware/conf/config.js`
3. 安装中间件服务所需node库
  进入 `~/yoyow-node-sdk/middleware/` 目录
  `npm install`
4. 启动中间件服务
  `npm start`

启动正常情况如下图
![启动正常情况如图](https://github.com/yoyow-org/yoyow-node-sdk/blob/master/middleware/public/images/step4.png)

## 接口说明

### 请求文档及示例

#### 1. 基础查询相关接口

##### 1.1. 获取指定账户信息 getAccount

  请求类型：GET

  请求参数：

    {Number} uid - 账号id

  请求示例：

    localhost:3000/api/v1/getAccount?uid=25638

  返回结果：

    {
      code: 作结果,
      message: 返回消息,
      data: { // 用户信息
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

##### 1.2. 获取指定账户近期活动记录 getHistory

  请求类型：GET

  请求参数：

    {Number} uid - 账号id
    {Number} op_type - 查询op类型 '0' 为 转账op，默认为null 即查询所有OP类型
    {Number} start 查询开始编号，为0时则从最新记录开始查询，默认为0
    {Number} limit - 查询长度，最大不可超过100条，默认为10

  请求示例：

`localhost:3000/api/v1/getHistory?uid=25638&start=1220&limit=30&op_type=0`

  返回结果：
```json
    {
      code: 操作结果,
      message: 返回消息,
      data: [] 历史记录对象数组
    }
```

##### 1.3. 验证块是否不可退回 confirmBlock

  请求类型：GET

  请求参数：

    {Number} block_num - 验证的块号

  请求示例：

    localhost:3000/api/v1/confirmBlock?block_num=4303231

  返回结果：
```json
    {
      code: 操作结果,
      message: 返回消息,
      data: 此块是否不可退回 
    }
```

##### 1.4. 获取指定资产信息 getAsset

  请求类型：GET

  请求参数：

```
{String | Number} search - 资产符号（大写）或 资产id
```

  请求示例：

```
http://localhost:3001/api/v1/getAsset?search=YOYOW
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

##### 1.5. 获取指定平台信息 getPlatformById

  请求类型：GET

  请求参数：
​	{Number} uid - 平台所有者账号uid

  请求示例：

```
http://localhost:3001/api/v1/getPlatformById?uid=217895094

```

  返回结果：

```
{
  "id": "1.6.0", - 平台 object id
  "owner": 217895094, - 平台所有者账号uid
  "name": "test-yoyow", - 平台名称
  "sequence": 1,
  "is_valid": true, - 是否有效
  "total_votes": 0, - 平台总票数
  "url": "http://demo.yoyow.org/", - 平台url地址
  "pledge": 1000000000, - 平台抵押（YOYO）
  "pledge_last_update": "2018-02-10T01:03:57", - 平台抵押最后更新时间
  "average_pledge": 176601774, - 平台平均抵押
  "average_pledge_last_update": "2018-02-11T06:49:12", - 平台平均抵押最后更新时间
  "average_pledge_next_update_block": 4562164, - 平台平均抵押下次更新块号
  "extra_data": "{}", - 平台拓展信息 
  "create_time": "2018-02-10T01:03:57", - 平台创建日期
  "last_update_time": "2018-02-11T06:49:12" - 平台最后更新日期
}
```

#### 

#### 2. 平台激励相关接口

##### 2.1. 转账到指定用户 transfer （需要安全验证的请求）

  请求类型：POST

  请求参数：

```json
 {Object} cipher - 请求的密文对象，格式如下
{
  ct, - 密文文本 16进制
  iv, - 向量 16进制
  s   - salt 16进制
}
```

请求对象结构:
```json
{Number} uid - 指定用户id
{Number} amount - 转出金额
{Number} asset_id - 资产id 
{string} memo - 备注
{Number} time - 操作时间
```
请求示例：参照 安全请求验证

```
localhost:3000/api/v1/transfer
```

 返回结果：

```json
{
  code: 操作结果,
  message: 返回消息,
  data: {
    block_num: 操作所属块号
    txid: 操作id
  }
}
```



##### 2.2. 获取转账二维码文本 getQRReceive（YOYOW APP 扫码可扫此二维码）

  请求类型：GET

  请求参数：

```
{Number} amount - 收款金额 （与收款备注都不填写的情况，用户可在APP中输入）

{String} memo - 收款备注 （与收款金额都不填写的情况，用户可在APP中输入）

{String | Number} asset - 转账资产符号 或 资产ID（默认为YOYO资产）
```

  请求示例：

```
http://localhost:3001/api/v1/getQRReceive?amount=98&memo=新的转账&asset_id=0
```

  返回结果：

```
{
  code: 操作结果,
  message: 返回消息,
  data: 收款二维码字符串
}
```

##### 2.3. 修改（仅增加白名单）授权用户资产白名单 updateAllowedAssets（需要安全验证的请求）

如果用户启用了资产白名单，则需要将UIA（用户发行资产）添加到用户的资产白名单中，才可以进行转账等交易。

  请求类型：POST

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
{Number} uid - 目标账户id

{Number} asset_id - 资产id
```

  请求示例：参照 安全请求验证

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

#### 3. 内容上链相关接口

##### 3.1. 发送文章 post（需要安全验证的请求）

  请求类型：POST

  请求参数：

    {Object} cipher - 请求对象密文对象
    
    {
      ct, - 密文文本 16进制
      iv, - 向量 16进制
      s   - salt 16进制
    }

  请求对象结构:

    {Number} platform - 平台账号
    {Number} poster - 发文人账号
    {Number} post_pid - 文章编号
    {String} title - 文章标题
    {String} body - 文章内容
    {String} extra_data - 文章拓展信息
    {String} origin_platform - 原文平台账号（默认 null）
    {String} origin_poster - 原文发文者账号（默认 null）
    {String} origin_post_pid - 原文文章编号（默认 null）
    {Number} time - 操作时间

  请求示例：参照 安全请求验证

```
localhost:3000/api/v1/post
```



  返回结果：

    {
      code: 操作结果,
      message: 返回消息,
      data: {
        block_num: 操作所属块号
        txid: 操作id
      }
    }

##### 3.2. 更新文章 postUpdate（需要安全验证的请求）

请求类型：POST

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
{Number} platform - 平台账号

{Number} poster - 发文人账号

{Number} post_pid - 文章编号

{String} title - 文章标题

{String} body - 文章内容

{String} extra_data - 文章拓展信息

{Number} time - 操作时间
```
  备注：修改文章操作时，title，body 和 extra_data 必须出现至少一个，并且与原文相同字段的内容不同

  请求示例：参照 安全请求验证

```
localhost:3000/api/v1/postUpdate
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
##### 3.3. 获取文章 getPost

  请求类型：GET

  请求参数：

    {Number} platform - 平台账号
    {Number} poster -发文者账号
    {Number} post_pid - 文章编号

  请求示例：

    http://localhost:3001/api/v1/getPost?platform=217895094&poster=210425155&post_pid=3

  返回结果：

```json
{
  code: 操作结果,
  message: 返回消息,
  data: {
    "id":"1.7.12", - 文章ObjectId
    "platform":217895094, - 平台账号
    "poster":210425155, - 发文者账号
    "post_pid":5, - 文章编号
    "hash_value":"bb76a28981710f513479fa0d11fee154795943146f364da699836fb1f375875f", - 文章body hash值
    "extra_data":"{}", - 拓展信息
    "title":"test title in js for update", - 文章title
    "body":"test boyd in js for update", - 文章内容
    "create_time":"2018-03-12T10:22:03", - 文章创建时间
    "last_update_time":"2018-03-12T10:23:24", - 文章最后更新时间
    "origin_platform", - 原文平台账号 （仅对于创建文章时为转发时存在）
    "origin_poster", - 原文发文者账号 （仅对于创建文章时为转发时存在）
    "origin_post_pid" - 原文发文编号 （仅对于创建文章时为转发时存在）
  }
}
```

##### 3.4. 获取文章列表 getPostList

  请求类型：GET

  请求参数：
```
{Number} platform - 平台账号
{Number} poster -发文者账号（默认null，为null时查询该平台所有文章）
{Number} limit - 加载数（默认20）
{String} start - 开始时间 'yyyy-MM-ddThh:mm:ss' ISOString （加载下一页时将当前加载出的数据的最后一条的create_time传入，不传则为从头加载）
```


  请求示例：

    http://localhost:3001/api/v1/getPostList?platform=217895094&poster=210425155&limit=2&start=2018-03-12T09:35:36

  返回结果：

```json
{
  code: 操作结果,
  message: 返回消息,
  data: [文章对象（参考获取单个文章返回的数据结构）]
}
```


#### 4. Auth 相关

##### 4.1. 签名平台 sign

  请求类型：GET

  请求参数：无

  请求示例：

    localhost:3000/auth/sign

  返回结果：

```json
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

##### 4.2 签名验证 verify

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

##### 4.3 签名平台 返回二维码 signQR

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

##### 平台拓展信息协议说明

平台属性 extra_data 拓展信息 JSON对象格式字符串 中
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

##### 4.4 平台扫码登录

App扫码授权登录将访问 平台拓展信息的 平台扫码登录请求接口 ，发送回用户签名对象

```json
{
  {Number} yoyow - 当前操作用户账号id
  {String} time - 签名时间戳字符串
  {String} sign - 签名字符串
  {String} state - 平台签名时传入的自定义信息 (参考 Auth 相关 4.3 - signQR)
}
```

约定 平台提供的接口必须返回以下信息
```json
{
  {Number} code - 操作结果 0 为通过 任何非 0 情况视为错误处理
  {String} message - 操作结果描述
}
```
### 请求返回 error code 状态说明

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

3001 文章ID必须为该平台该发文人的上一篇文章ID +1（平台管理发文id）


### 安全请求验证

涉及到资金安全相关的操作，比如转账，发文等各种写操作，会在中间件服务中验证其有效性。这类请求的信息需要先通过加密操作转换成密文，再发送给中间件服务。加密方式采用对称加密AES，密钥为配置文件中的`secure_key`。



加密示例(javascript的 crypto-js 版，其他语言使用类似的AES加密方式)

默认 mode CBC , padding scheme Pkcs7

例如：transfer操作
```javascript
    let key = 'customkey123456'; // 此key与中间件中的config 里 secure_key相同

    let sendObj = {
      "uid": 9638251,
      "amount": 100,
      "memo": "hello yoyow",
      "time": Date.now()  //time 字段 操作时间取当前时间毫秒值 加密操作须带有此字段 用于验证操作时效
    }

    let cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key);
    
    $.ajax({
      url: 'localhost:3000/api/v1/transfer',
      type: 'POST',
      data: {
        ct: cipher.ciphertext.toString(CryptoJS.enc.Hex),
        iv: cipher.iv.toString(),
        s: cipher.salt.toString()
      },
      success: function(res){
        // do something ...
      }
    })
```
PHP加密方式
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


其他需要安全请求验证的操作根据文档改动sendObj

