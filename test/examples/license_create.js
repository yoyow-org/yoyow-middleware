var CryptoJS = require('crypto-js')
const request = require('request')
// var JSON = require("json")

var p = console.log
let key = 'thisissec'
let type = 0;
let hash_value = 'hash';
let title = 'title';
let body = 'body';
let extra_data = 'extra_data'

let sendObj = {
  type,
  hash_value,
  title,
  body,
  extra_data,
  time: Date.now()
}

cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key)

// p(cipher.ciphertext.toString(CryptoJS.enc.Hex));

// p(cipher.iv.toString());

// p(cipher.salt.toString());

request.post(
  'http://127.0.0.1:3001/api/v2/create_license',
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
