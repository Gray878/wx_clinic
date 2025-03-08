// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 获取当前环境的标识符
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('云函数login - 接收到的参数:', event)
  
  try {
    // 获取微信上下文
    const wxContext = cloud.getWXContext()
    console.log('云函数login - 微信上下文:', wxContext)

    // 返回用户openid等信息
    return {
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
      env: wxContext.ENV,
    }
  } catch (error) {
    console.error('云函数login - 执行失败:', error)
    throw error
  }
} 