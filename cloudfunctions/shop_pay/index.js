const cloud = require('wx-server-sdk');
const cloudbase = require("@cloudbase/node-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const models = app.models;
const ORDER_MODEL_KEY = 'shop_order';
const ORDER_ITEM_MODEL_KEY = 'shop_order_item';

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { orderId, totalPrice } = event;
  
  console.log(`处理订单支付：订单ID=${orderId}, 金额=${totalPrice}`);
  
  try {
    const res = await cloud.callFunction({
      name: 'cloudbase_module',
      data: {
        name: 'wxpay_order',
        data: {
          description: '服务订单',
          amount: {
            total: Math.round(totalPrice * 100),  // 转换为分
            currency: 'CNY',
          },
          out_trade_no: orderId,
          payer: {
            openid: wxContext.OPENID,
          },
        },
      },
    });
    
    console.log("支付结果:", JSON.stringify(res.result, null, 2));
    return res.result;
  } catch (err) {
    console.error("支付调用错误:", err);
    throw err;
  }
};
