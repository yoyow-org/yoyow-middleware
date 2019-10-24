var CryptoJS = require('crypto-js')
const request = require('request')
// var JSON = require("json")

let key = 'thisissec'

let sendObj = {
  from_account: 291774116,
  platform: 396291915,
  poster: 305154832,
  pid: 143,
  score: 5,
  csaf: 100000,
  time: new Date().getTime()
}

cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key)

// p(cipher.ciphertext.toString(CryptoJS.enc.Hex));

// p(cipher.iv.toString());

// p(cipher.salt.toString());

request.post(
  'http://127.0.0.1:3001/api/v2/posts/score',
  {
    json: {
      ct: cipher.ciphertext.toString(CryptoJS.enc.Hex),
      iv: cipher.iv.toString(),
      s: cipher.salt.toString()
    }
  },
  (error, res, body) => {
    if (error) {
      console.error(error)
      return
    }
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body)
  }
)
