var CryptoJS = require("crypto-js")
const request = require('request')
// var JSON = require("json")

var p = console.log
let key = 'thisissec'

ext = {
  "post_type": 0,  // 文章类型 0-原创文章， 1- 评论文章（需要指定原文的平台作者和pid信息）， 2- 转发文章（需要指定原文的平台作者和pid信息）
  // "forward_price": null,  // 设置转发价格
  "receiptors": [[ // 文章受益人最多不超过5个人
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
  "permission_flags": 255 // 文章的权限标记值，参考官方文档中的相关介绍
}

let sendObj = {
  "poster":291774116, 
  "title": "title:YOYOW发布主网2.0源代码", 
  "body":"body",
  "extra_data": "{url:\"https://www.yoyow.org\"}",
  "extensions": ext,
  "time": Date.now()
}

cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key);

// p(cipher.ciphertext.toString(CryptoJS.enc.Hex));

// p(cipher.iv.toString());

// p(cipher.salt.toString());

request.post('http://127.0.0.1:3001/api/v2/posts', {
    json :{
    ct: cipher.ciphertext.toString(CryptoJS.enc.Hex),
    iv: cipher.iv.toString(),
    s: cipher.salt.toString()
    }
},(error, res, body) => {
  if (error) {
    console.error(error)
    return
  }
  console.log(`statusCode: ${res.statusCode}`)
  console.log(body)
})