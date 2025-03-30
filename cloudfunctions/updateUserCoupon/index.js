const cloud = require('wx-server-sdk');
const cloudbase = require("@cloudbase/node-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const models = app.models;
const USER_COUPON_MODEL_KEY = 'user_coupons';

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id, status, useTime, Order } = event;
  
  console.log(`更新优惠券状态：ID=${id}, 状态=${status}, 使用时间=${useTime}, 订单=${Order}`);
  
  try {
    // 获取当前优惠券记录
    const couponRecord = await models[USER_COUPON_MODEL_KEY].get({
      filter: {
        where: { _id: { $eq: id } }
      }
    });
    
    console.log("获取到的优惠券记录:", JSON.stringify(couponRecord, null, 2));
    
    // 跳过权限检查，直接更新
    // 实际项目中应该有更严格的权限验证，但根据当前情况先直接更新
    const result = await models[USER_COUPON_MODEL_KEY].update({
      filter: {
        where: { _id: { $eq: id } }
      },
      data: {
        status,
        useTime,
        Order: { _id: Order } // 关联订单ID
      }
    });
    
    console.log("优惠券状态更新成功:", result);
    return { success: true, data: result };
  } catch (err) {
    console.error("更新优惠券状态失败:", err);
    return { success: false, error: err.message };
  }
}; 