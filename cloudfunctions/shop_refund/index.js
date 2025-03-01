const cloud = require('wx-server-sdk');
const cloudbase = require("@cloudbase/node-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const models = app.models;
const ORDER_MODEL_KEY = 'shop_order';
const ORDER_ITEM_MODEL_KEY = 'shop_order_item';

const VALID_STATUS = ["TO_SEND", "TO_RECEIVE", "FINISHED"]

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
  if (!VALID_STATUS.includes(order.status)) {
    throw new Error("invalid order status", order.status);
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
      name: 'wxpay_refund',
      data: {
        out_refund_no: order._id,
        out_trade_no: order._id,
        amount: {
          refund: totalPrice * 100,
          total: totalPrice * 100,
          currency: 'CNY',
        },
      },
    },
  });
  return res.result;
};
