var CryptoJS = require('crypto-js')
const request = require('request')
// var JSON = require("json")

var p = console.log
let key = 'thisissec'

let sendObj = {
  issuer: 460444828,
  from: 318865995,
  to: 460444828,
  amount: 200000,
  time: Date.now()
}

console.log(sendObj)

var cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key)

// p(cipher.ciphertext.toString(CryptoJS.enc.Hex));

// p(cipher.iv.toString());

// p(cipher.salt.toString());

request.post(
  'http://127.0.0.1:3001/api/v2/collect_benefit_csaf',
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
