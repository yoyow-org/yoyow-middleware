# yoyow-middleware

Using YOYOW middleware is the easiest way to access the platform. It mainly provides three interfaces: account authorization, content/platform incentives and content posting. You can use Docker one-click deployment to get the corresponding APIs to easily interact with the YOYOW blockchain.

YOYOW middleware communicates with YOYOW network through the API interface of YOYOW node, which provides platform service providers with convenient interfaces to access the data on the chain, ensuring that traditional business codes can reach the requirements of getting on chain with only minimal changes. The specific diagram is as follow:

![YOYOW Middleware Function Diagram](https://github.com/yoyow-org/yoyow-middleware/blob/master/public/images/architecture.png)

For the creation steps of the platform, please refer to: [Create a YOYOW platform account from 0](https://wiki.yoyow.org/en/latest/others/create_platform.html)

## Deployment Start

### Configuration File Description

The path to the configuration file is in the `conf/config.js` file in the code path. If you start it in docker mode, you can map the configuration file to the path `/app/conf` in the container.

```javascript
{
    // The api server address, the Testnet public api address are as follows. For the official network deployment, please change the address. For example, the official network public api address：wss://api-bj.yoyow.org/ws
    apiServer: "wss://api.testnet.yoyow.org",

    // The validity time of the security request, in unit "s", if the requested content exceeds the validity period, it will return "The request 1003 has expired".
    secure_ageing: 60,

    // The platform security request verification key can be customized. For details, see "Security Access"
    secure_key: "",

    // Platform owner active key
    active_key: "",

    // Platform owner secondary key
    secondary_key: "",

    // Platform owner memo key
    memo_key: "",

    // Platform id(yoyow id)
    platform_id: "",

    // Whether use points to pay fees
    use_csaf: true,

    // Whether transfer to the balance, otherwise it is transferred to tippings
    to_balance: false,

    // Wallet authorization page URL, Testnet address are as follows, official network address“https://wallet.yoyow.org/#/authorize-service”
    wallet_url: "http://demo.yoyow.org:8000/#/authorize-service"
}
```
Notes:

1. In the general usage scenario, the middleware suggests  to use the secondary key and the memo key at most, and the secondary key and the memo key can satisfy most of the requirements. Do not input the active key into the configuration file unless you are sure you need to use the active key.
2. Encryption requests (`secure_key`) are used in the middleware to ensure security. However, it is strongly recommended to deploy the internal network, isolate it, and ensure the security of the private key.
3. It is recommended to use the point to deduct for the handling fees. If the deduction fails, it will directly report the error and will not automatically deduct the tippings as the handling fees.

### Docker One-click Deployment

```bash
docker run -itd --name yoyow-middleware -v <local configuration file path>:/app/conf -p 3001:3001 yoyoworg/yoyow-middleware
```

### Manual Deployment

1. Clone source code
    `git clone https://github.com/yoyow-org/yoyow-middleware.git`
2. Modify middleware configuration
    Modify the file by referring to the configuration file description ()`yoyow-middleware/conf/config.js`
3. Install the node library required by the middleware service
    Enter `~/yoyow-middleware/` directory
    `npm install`
4. Start middleware service
    `npm start`

Start normal state as shown below
![Start normal state as shown](https://github.com/yoyow-org/yoyow-middleware/blob/master/public/images/step4.png)

## V2 Interface Description

### Request documents and examples

#### 1. Basic query interface

##### 1.1. Get the specified account information /accounts

  Request type：GET

  Request path：/accounts/:uid
  
    {Number} uid - account id

  Request parameter：

    Null

  Request example：

    localhost:3000/api/v2/accounts/30833

  Returned result：
```
    {
      code: operation result,
      message: return message,
      data: { // user information
        id: account Object Id
        uid: account uid
        name: account name
        owner: owner authority
        active: active authority
        secondary: secondary authority
        memo_key: memo key
        reg_info: registration information
        can_post: whether can post
        can_reply: whehter can reply
        can_rate: whether can rate
        is_full_member: is full member or not
        is_registrar: is registrar or not
        is_admin: is administrator or not
        statistics: { //Users' YOYO asset details
          obj_id: asset object id
          core_balance: balance
          prepaid: tippings
          csaf: points
          total_witness_pledge: total witness pledge (pledge amount by users for creating witnesses)
          total_committee_member_pledge: total committee pledge（pledge amount by users for creating committees）
          total_platform_pledge: total platform pledge（pledge amount by users for creating platforms）
          releasing_witness_pledge: witness pledge to be returned
          releasing_committee_member_pledge: committee pledge to be returned
          releasing_platform_pledge: platform pledge to be returned
        }
        assets: [ //All assets owned by the users
            {
                amount: asset amount,
                asset_id: asset id,
                precision: asset precision,
                symbol: asset symbol,
                description: asset description"
            }
            ...
        ]
      }
    }
```

##### 1.2. Get the recent activity history of the specified account /accounts/:uid/histories

  Request type：GET

  Request path：/accounts/:uid/histories

    {Number} uid - account id

  Request parameters：
    
    {Number} op_type - Query op type, '0' for transfer op, default is null, query all OP types
    {Number} start - Query start number. When it is 0, the query starts from the latest record. The default is 0.
    {Number} limit - Query the length. The length of the query cannot exceed 100. The default is 10.

  Request example：

  `localhost:3000/api/v2/accounts/30833/histories?start=0&limit=2&op_type=0`

  Returned results：
```
    {
      code: operation result,
      message: return message,
      data: [] Array of history objects
    }
```

##### 1.3. Query the permissions granted to the platform by the account

  Request type：GET

  Request path：/authPermissions

  Request parameters：

    {Number} platform - platform accounts
    {Number} account - initial query account

  Requst example：

    localhost:3000/api/v2/authPermissions?platform=33313&account=31479

  Returned results：

```
    {
      code: operation results,
      message: return message,
      data: [
        {
            "id": "2.22.0", 
            "account": 30833, account id
            "platform": 33313, platform id
            "max_limit": 1000000000, the maximum amount of tippings for the authorized platform
            "cur_used": 0,  the amount of tippings currently used
            "is_active": true,  authorization status，false the authorization is invalid
            "permission_flags": 255  detailed authorization authority
        }
    ]
    }
```

##### 1.4. Get the specified asset information
  Request type：GET

  Request path：/assets/YOYO

  Request parameter：

```
{String | Number} search - asset symbol（capital）or asset id
```

  Request example：

```
http://localhost:3001/api/v2/assets/YOYO
```

  Returned results：

```
{
  code: operation results,
  message: returned message,
  data: {
    "id":"1.3.0", - asset object id
    "asset_id":0, - asset id
    "symbol":"YOYO", - asset symbol
    "precision":5, - asset precision
    "issuer":1264, - asset issuer uid
    "options":{
      "max_supply":"200000000000000", - maximum amount of circulation
      "market_fee_percent":0, - transaction fee percentage
      "max_market_fee":"1000000000000000", - transaction fee maximum
      "issuer_permissions":0, - asset available permissions
      "flags":0, - asset permissions
      "whitelist_authorities":[], - asset whitelist administrator list 
      "blacklist_authorities":[], - asset blacklist administrator list
      "whitelist_markets":[], - transaction pair whitelist
      "blacklist_markets":[], - transaction pair blacklist
      "description":"" - asset description
    },
    "dynamic_asset_data_id":"2.2.0", - asset dynamics object id
    "dynamic_asset_data":{
      "id":"2.2.0", - asset dynamics object id
      "asset_id":0,
      "current_supply":"107384564466939", - Current circulation of assets
      "accumulated_fees":0
    },
    "current_supply":"107384564466939",  - Current circulation of assets
    "accumulated_fees":0
  }
}

```

##### 1.5. Get block details
  Request type：GET

  Request path：/blocks/:block_num

  Request parameter：

​ {Number} block_num - Block height (block number)

  Request example：

```
http://localhost:3001/api/v2/blocks/100

```

  Returned results：

```
{
        "previous": "000000630ad27ed2acab3af49cf6e6ac7a8f0c39",
        "timestamp": "2019-06-11T11:37:57",
        "witness": 25997,
        "transaction_merkle_root": "0000000000000000000000000000000000000000",
        "witness_signature": "1f2e29ec9b44ead78ffae6ab8f8e11a5d9beab6064146b21f96f8e43b07eb88c741c87140270bd57ea9efd8fe9327adb53fe2aae5f583c848b87f76648886660c9",
        "transactions": [], - All transactions included in the block
        "block_id": "00000064742ada3ddd9efc1c8bf35f28757fa150",
        "signing_key": "YYW587fGuqZXBiXUsoKdwb73RP1WE7AHNgXF5kZ7vSueq7gp6WXGk",
        "transaction_ids": []
    }
```

##### 1.6. Get block status (whether it is irreversible)
  Request type：GET

  Request path：/blocks/:block_num/confirmed

  Request parameter：
  
​ {Number} block_num - Verified block height (block number)

  Request example：
```
http://localhost:3001/api/v2/blocks/100/confirmed
```


  Returned results：
```
    {
      code: operation results,
      message: return message,
      data: Whether this block is non-returnable 
    }
```


#### 

#### 2. Post related APIs
##### 2.1. Query posts
  Request type：GET

  Request path：/posts

  Request parameters：
  ​{Number} platform - platform account id
  ​{Number} poster - Poster account id
 ​ {Number} post_pid - post pid

```
localhost:3000/api/v2/posts?poster=30833&post_pid=2&platform=33313
```

 Returned results：

```
{
  "id": "1.7.1",  - psot Object id
  "platform": 33313, - platform id
  "poster": 30833, - poster account id
  "post_pid": 2, - post pid
  "origin_poster": 30833, - original post's poster account id
  "origin_post_pid": 1, - original post's post pid
  "origin_platform": 33313, - account id of the platform where the original post is located
  "hash_value": "945456321", - post hash
  "extra_data": "coammentextry", - post extension information
  "title": "commentname", - post title
  "body": "commentbody", - post body
  "create_time": "2019-07-01T13:49:33", - creation time
  "last_update_time": "2019-07-01T13:49:33", - last modified time
  "receiptors": [  - receiptor list
      [
          30833,
          {
              "cur_ratio": 7500, - ratio of benefit
              "to_buyout": false, - Whether to sell the ratio of benefit
              "buyout_ratio": 0, - sell the ratio of benefit
              "buyout_price": 0, - sale price
              "buyout_expiration": "1969-12-31T23:59:59" - sale expiration time
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
  "license_lid": 1, # copyright license id
  "permission_flags": 255, # post permission
  "score_settlement": false # Whether the post has participated in the distribution of rating revenue
}
```



##### 2.2. Posting

  Request type：POST

  Request path：/posts

    {Object} cipher - Request object ciphertext object
    
    {
      ct, - Ciphertext hexadecimal
      iv, - Vector hexadecimal
      s   - salt hexadecimal
    }

  Request object structure:

    {Number} platform - platform account
    {Number} poster - poster account
    {String} title - post title
    {String} body - post content
    {String} url - The link to the original text of the post (which will be presented in the extra_data of the post on the chain)
    {String} hash_value - Hash value, if this parameter is not provided, the sha256 value of the body content is used by default.
    {Number} origin_platform - original post platform account（default null）
    {Number} origin_poster - original post poster account（default null）
    {Number} origin_post_pid - original post number（默认 null）
    {Number} time - operation time

  Request example：Refer to security request verification

```
http://localhost:3001/api/v2/posts
```

  Returned results：

```
{
  "block_num": 858010, - quoted block number in transaction broadcast
  "txid": "10fdf2976789fb876c0ca7417abd74a6eecd8564", - transaction id
  "post": { - post details
      "platform": "33313",
      "poster": "30833",
      "post_pid": 6,
      "hash_value": "79f0f1c9f5d2cb0762407dc77b92626bb970c14288c7e789552c7e840bf94b0f",
      "extra_data": "{\"url\":\"https://www.biask.com/\"}",
      "title": "title:YOYOW Released the Mainnet 2.0 Source Code",
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

##### 2.3. Rate the post

The platform can use the permissions of the authorized account to rate the posts for the users.

  Request type：POST

  Request path：/posts/score

  Request parameters：

```
{Object} cipher - Request object ciphertext object

{
  ct, - ciphertext hexadecimal
  iv, - vector hexadecimal
  s   - salt hexadecimal
}
```

  Request object structure:

```
    {Number} from_account - rater account
    {Number} platform - platform account
    {Number} poster - poster account
    {String} pid - post pid
    {Number} score - rate points, the range is [-5, 5]
    {Number} csaf - number of points used for rating
    {Number} time - operation time
```

  Request example: refer to security request verification
```
localhost:3000/api/v2/posts/score
```

  Returned results：

```
{
  code: operation results,
  message: return message,
  data: {
    block_num: operation block number
    txid: operation id
  }
}

```


##### 2.3. Rewarding posts
The platform can represent common accounts to reward other posts.

The tippings of the account will be used for rewarding and it will also consume the amount of the tippings of the authorized platform.

  Request type：POST

  Request path：/posts/reward-proxy

  Request parameters：

```
{Object} cipher - Request object ciphertext object

{
  ct, - Ciphertext hexadecimal
  iv, - Vector hexadecimal
  s   - salt hexadecimal
}
```

  Request object structure:

```
    {Number} from_account - rater account
    {Number} platform - platform account
    {Number} poster - poster account
    {String} pid - post pid
    {Number} amount - rating points, the range is [-5, 5]
    {Number} csaf - Number of points used for rating
    {Number} time - operation time
```

  Request example: refer to security request verification
```
localhost:3000/api/v2/posts/reward-proxy
```

  Returned results：

```
{
  code: operation results,
  message: return message,
  data: {
    block_num: operation block number
    txid: operation id
  }
}
```

##### 2.4. Get post list

  Request type：GET

  Request path：/posts/getPostList

  Request parameters：
```
{Number} platform - platform account
{Number} poster -poster account（default is null，query all posts of the platform when it is null）
{Number} limit - load number（default is 20）
{String} start - starting time 'yyyy-MM-ddThh:mm:ss' ISOString （When the next page is loaded, the last_create_time of the currently loaded data is passed in. If it is not passed, it is loaded from the beginning.）
```


  Request example：

    http://localhost:3001/api/v2/posts/getPostList?start=2019-07-11T07:04:37&limit=2&poster=30834

  Returned results：

```
{
  code: operation results,
  message: return message,
  data: [post object (refer to the returned data structure by getting a single post)]
}
```

##### 2.5 Get the rating list for a post
  Request type：GET

  Request path：/posts/listScores

  Request parameters：

```
{Number} platform - platform account
{Number} poster -poster account
{Number} pid - post pid
{Number} lower_bound_score - The original rating object id, the default is "0.0.0"
{Number} limit - The maximum number of results returned
{Boolean} list_cur_period - Whether to take only the data of the current reward cycle, the default is true
```

  Request example：

    http://localhost:3001/api/v2/posts/listScores?platform=33313&poster=30833&pid=2&lower_bound_score=2.16.3&limit=10&list_cur_period=true

  Returned results：

```
{
    "code": 0,
    "data": [ // rating history
        {
            "id": "2.16.3", // rating Object id
            "from_account_uid": 31479, // rater
            "platform": 33313,
            "poster": 30833,
            "post_pid": 2,
            "score": 5,
            "csaf": 23333,
            "period_sequence": 0,   // cycle number of the rating
            "profits": 0,  // income of rating
            "create_time": "2019-07-07T07:40:45"
        }
    ],
    "message": "successful operation"
}
```

#### 3. @TODO  Advertising Related APIs

##### 3.1. @TODO Publishing an ad slot
  Request type：POST

  Request path：/advertising

    {Object} cipher - Request object ciphertext object
    
    {
      ct, - Ciphertext hexadecimal
      iv, - Vector hexadecimal
      s   - salt hexadecimal
    }

  Request object structure:

    {Number} platform - platform account
    {String} platform - Ad slot description
    {Number} unit_price - Unit time price
    {Number} unit_time - Unit of time

  Request example: refer to security request verification

```
http://localhost:3001/api/v2/advertising
```

  Returned results：

```
{
}
```

##### 3.2 @TODO Update ad slot
  Request type：PATCH

  Request path：/advertising
  {Object} cipher - Request object ciphertext object
  
  {
    ct, - ciphertext hexadecimal
    iv, - vector hexadecimal
    s   - salt hexadecimal
  }

  Request object structure:


    {Number} platform - platform account
    {String} advertising_aid - advertising id
    {String} description - Ad slot description
    {Number} unit_price - Unit time price
    {Number} unit_time - Unit of time
    {Boolean} on_sell - State of sale

  Request example：

    localhost:3000/api/v2/advertising

  Returned result：

```
{
}
```

##### 3.3 @TODO Buying an ad slot
  Request type：POST

  Request path：/advertising/buy
  {Object} cipher - Request object ciphertext object
  
  {
    ct, - ciphertext hexadecimal
    iv, - vector hexadecimal
    s   - salt hexadecimal
  }

  Request object structure:

    {Number} account - account id or account name
    {Number} platform - platform account
    {String} advertising_aid - advertising id
    {Number} start_time - starting time
    {Number} buy_number - number of purchases
    {String} extra_data - extra information
    {String} memo - memo

  Request example：

    localhost:3000/api/v2/advertising/buy

  Returned results：

```
{
}
```

##### 3.4 @TODO Confirm Ad Order
  Request type：POST

  Request path：/advertising/confirm
  {Object} cipher - Request object ciphertext object
  
  {
    ct, - ciphertext hexadecimal
    iv, - vector hexadecimal
    s   - salt hexadecimal
  }

  Request object structure:

    {Number} platform - platform account
    {String} advertising_aid - advertising id
    {Number} advertising_order_oid - ad slot order id
    {Boolean} confirm - confirm or reject an ad slot order

  Request example：

    localhost:3000/api/v2/advertising/confirm

  Returned result：

```
{
}
```

##### 3.5 @TODO Redeem ad slot order
  Request type：POST

  Request path：/advertising/ransom
  {Object} cipher - Request object ciphertext object
  
  {
    ct, - ciphertext hexadecimal
    iv, - vector hexadecimal
    s   - salt hexadecimal
  }

  Request object structure:

    {Number} from_account - user id or name
    {Number} platform - platform account
    {String} advertising_aid - advertising id
    {Number} advertising_order_oid - ad slot order id 

  Request example：

    localhost:3000/api/v2/advertising/ransom

  Returned result：

```
{
}
```

##### 3.6 @TODO Redeem ad slot order
  Request type：POST

  Request path：/advertising/ransom
  {Object} cipher - Request object ciphertext object
  
  {
    ct, - ciphertext hexadecimal
    iv, - vector hexadecimal
    s   - salt hexadecimal
  }

  Request object structure:

    {Number} from_account - user id or name
    {Number} platform - platform account
    {String} advertising_aid - advertising id
    {Number} advertising_order_oid - ad slot order id 

  Request example：

    localhost:3000/api/v2/advertising/ransom

  Returned result：

```
{
}
```

##### 3.7 @TODO Query the permissions granted to the platform by the account
  Request type：GET

  Request path：/advertising

  Request parameters：

    {Number} platform - platform account
    {String} lower_bound_advertising - initial advertising id
    {Number} limit - number of results returned
 
  Request example：

    localhost:3000/api/v2/advertising?platform=33136&lower_bound_advertising=0.0.0&limit=100

  Returned result：

```
{
}
```


#### 4. Other transactions
##### 4.1. Transfer
  Request type：POST

  Request path：/transfer

  Request parameters：

```
 {Object} cipher - The request ciphertext object has the following format
{
  ct, - ciphertext hexadecimal
  iv, - vector hexadecimal
  s   - salt hexadecimal
}
```

Request object structure:
```
{Number} uid - specified user id
{Number} amount - transfer-out amount
{Number} asset_id - asset id 
{string} memo - memo
{Number} time - operation time
```
Request example: refer to security request verification

```
localhost:3000/api/v2/transfer
```

 Returned results：

```
{
  code: operation result,
  message: return message,
  data: {
    block_num: operation block number
    txid: operation id
  }
}
```


#### 5. Auth related
##### 5.1. Signature platform sign
  Request type：GET

  Request parameter：null

  Request example：

    localhost:3000/auth/sign

  Returned results：

```
{
  code: operation result,
  message: return message,
  data: {
    sign: signature result,
    time: operation time (millisecond value),
    platform:platform owner id,
    url: wallet authorization url
  }
}
```

##### 5.2 Signature verification verify
  Request type：GET

  Request parameters：

    {Number} yoyow - account id
    {Number} time - operation time millisecond value
    {String} sign - signature result

  Request example：

    localhost:3000/auth/verify?sign=20724e65c0d763a0cc99436ab79b95c02fbb3f352e3f9f749716b6dac84c1dc27e5e34ff8f0499ba7d94f1d14098c6a60f21f2a24a1597791d8f7dda47559c39a0&time=1517534429858&yoyow=217895094

  Returned results：

    {
      code: operation result,
      message: return message,
      data: {
        verify: Whether the signature is successful,
        name: Signed yoyow username
      }
    }

##### 5.3 Signature Platform Return to QR code signQR
  Request type：GET

  Request parameters：

    {String} state - The extended information will be sent to the platform together with the user signature information when the platform login interface is invoked. It is used when the platform login interface needs a customized parameter. If there is no such requirement, the information may not be transmitted.

  Request example：

    localhost:3000/auth/signQR?state=platformCustomParams

  Returned results：
```
{
  code: operation result,
  message: return message,
  data: QR code image base64 string
}
```

##### 5.4 Platform Extension Information Protocol Description
Platform property extra_data extension information JSON object format string
```javascript
{
    "login":"http://example/login" //platform code-scanning login request interface
    "description":"platform description"  //platform description
    "image":"http://example.image.jpg" //platform profile image, yoyow app 1.1, displayed platform profile image
    "h5url":"http://exampleH5.com" //platform h5 address, used to jump to h5 page without app jumping
    "packagename":"com.example.app" //platform android jump
    "urlscheme":"example://"  //platform ios jump
}
```

##### 5.5 Platform login by scanning QR code
App QR code-scanning authorized login will access the platform code-scanning login request interface of the platform extended information, and send back the user signature object.

```
{
  {Number} yoyow - Current operation user account id
  {String} time - Signature timestamp string
  {String} sign - Signature string
  {String} state - Custom information passed in when the platform signed (Refer to Auth Related 4.3 - signQR)
}
```

The interface provided by the platform must return the following information```
{
  {Number} code - If operation result is 0, it passed; any non-zero case is treated as an error.
  
  {String} message - operation result description
}
```

### Request to return error code status description

```
1001 Invalid signature type

1002 Invalid signature time

1003 Request has expired

1004 Invalid operation time

1005 Invalid operation signature

1006 The account information does not match the chain (usually after the private key is restored, using the local data of other computers or the old backup file for authorization operation)

1007 Unauthorized platform

2000 Api underlying exception

2001 Account does not exist

2002 Invalid account

2003 Invalid transfer amount

2004 Insufficient tippings and points to pay fees

2005 Insufficient tippings

2006 Invalid asset symbol or id

3001 The post ID must be the platform poster's last post ID +1 (platform manages the id)
```

### Security request verification

In terms of financial security-related operations, such as transfer, posting, and other write operations, its effectiveness will be verified in the middleware service. The information of such requests needs to be converted into ciphertext by encryption and then sent to the middleware service. The encryption method uses symmetric encryption AES, and the key is `secure_key` in the configuration file.


Encryption example (crypto-js version of javascript, other languages use similar AES encryption)

The default is mode CBC , padding scheme Pkcs7

For example: transfer operation
```javascript
    let key = 'customkey123456'; // This key is the same as the secure_key in the config in the middleware.

    let sendObj = {
      "uid": 9638251,
      "amount": 100,
      "memo": "hello yoyow",
      "time": Date.now()  //time field 
      The operation time takes the current time millisecond value. Encryption must have this field for verifying the operation time
    }

    let cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key);
    
    $.ajax({
      url: 'localhost:3000/api/v2/transfer',
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
PHP encryption
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


Other operations that require secure request verification change sendObj according to the documentation

