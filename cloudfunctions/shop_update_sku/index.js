// 云函数入口文件
const cloud = require('wx-server-sdk')
const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const models = app.models;
const SKU_MODEL_KEY = 'shop_sku';

// 云函数入口函数
exports.main = async (event) => {
  const { skuId, data } = event
  return models[SKU_MODEL_KEY].update({
    data,
    filter: {
      where: {
        _id: {
          $eq: skuId,
        },
      },
    },
  });
}