var CryptoJS = require('crypto-js')
const request = require('request')

let key = 'thisissec'

let sendObj = {
  platform: 271617537,
  advertising_aid: 3,
  advertising_order_oid: 3,
  isconfirm: true,
  time: Date.now()
}

let cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key)
// 创建广告位
request.post(
  'http://127.0.0.1:3001/api/v2/advertising/confirm',
  {
    json: {
      ct: cipher.ciphertext.toString(CryptoJS.enc.Hex),
      iv: cipher.iv.toString(),
      s: cipher.salt.toString()
    }
  },
  (error, res, body) => {
    error && console.log(error)

    console.log(body)
  }
)
