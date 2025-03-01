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
  const { orderId } = event;
  const order = (await models[ORDER_MODEL_KEY].get({
    filter: {
      where: {
        _id: {
          $eq: orderId
        }
      }
    },
    select: {
      $master: true,
      order_item: {
        _id: true
      }
    }
  })).data;
  if (wxContext.OPENID !== order._openid) {
    throw new Error("invalid caller");
  }
  const skus = await Promise.all(order.order_item.map(async orderItem => (await models[ORDER_ITEM_MODEL_KEY].get({
    filter: {
      where: { _id: { $eq: orderItem._id } }
    },
    select: {
      count: true,
      sku: {
        price: true
      }
    }
  })).data));
  const totalPrice = skus.reduce((acc, cur) => acc + cur.count * cur.sku.price, 0);

  const res = await cloud.callFunction({
    name: 'cloudbase_module',
    data: {
      name: 'wxpay_order',
      data: {
        description: 'description',
        amount: {
          total: totalPrice * 100,
          currency: 'CNY',
        },
        // 商户生成的订单号
        out_trade_no: order._id,
        payer: {
          // 服务端云函数中直接获取当前用户openId
          openid: wxContext.OPENID,
        },
      },
    },
  });
  console.log("wxpay_order result", res, JSON.stringify(res,null,2));
  return res.result;
};
