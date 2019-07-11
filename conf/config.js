module.exports = {
  // api服务器地址
  apiServer: "ws://36.110.189.113:11011",
  // 请求有效时间，单位s
  secure_ageing: 120,
  // 平台安全请求验证key 由平台自定义
  secure_key: "thisissec",
  // 平台所有者active私钥
  active_key: "",
  // 平台所有者零钱私钥
  secondary_key: "5KbuHNCM1wxA5wM3nCXV4V3Dj7Rgs94wpvv5KxcFBuQPJH4XH8U", // platform1
  // 平台所有者备注私钥
  memo_key: "5KbuHNCM1wxA5wM3nCXV4V3Dj7Rgs94wpvv5KxcFBuQPJH4XH8U",
  // 平台id(yoyow id)
  platform_id: "33313",  // platform1
  // 转账是否使用积分
  use_csaf: true,
  // 转账是否转到余额 否则转到零钱
  to_balance: false,
  // 钱包授权页URL
  wallet_url: "http://demo.yoyow.org:8000/#/authorize-service"
};