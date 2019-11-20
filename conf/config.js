module.exports = {
  // api服务器地址
  apiServer: 'wss://api.testnet.yoyow.org',
  // 请求有效时间，单位s
  secure_ageing: 120,
  // 平台安全请求验证key 由平台自定义
  secure_key: 'thisissec',
  // 平台所有者active私钥
  active_key: '5JJEBLMCa8FrMTzksHMrMqAyiwwUixcvJQjSnyFPKNe8mR79bUF',
  // 平台所有者零钱私钥
  secondary_key: '5J4xywHPn2yPW7a8eV6Ff1ZRm5zsEav2EAiSTJu4huEGxWDVfb2', // platform1
  // 平台所有者备注私钥
  memo_key: '5K8zY2ZpFtHC8STGbMFLUe33oJnsPe7LxYgt1qkDMZFebetF8CQ',
  // 平台id(yoyow id)
  platform_id: "271617537", // platform1
  // 转账是否使用积分
  use_csaf: true,
  // 转账是否转到余额 否则转到零钱
  to_balance: false,
  // 钱包授权页URL
  wallet_url: 'http://demo.yoyow.org:8000/#/authorize-service',
  // 浏览器api
  explorer_url: 'https://testnet.explorer.yoyow.org/api/v1'
}
