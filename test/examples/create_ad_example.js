var CryptoJS = require('crypto-js')
const request = require('request')

let key = 'thisissec'

let sendObj = {
  platform: 271617537,
  description: 'VVVVV',
  unit_price: 100,
  unit_time: 86400,
  time: Date.now()
}

let cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key)
// 创建广告位
request.post(
  'http://127.0.0.1:3001/api/v2/advertising',
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
