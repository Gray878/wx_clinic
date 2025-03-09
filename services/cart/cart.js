import { model, getAll } from '../../services/_utils/model';
import { config } from '../../config/index';
import { DATA_MODEL_KEY } from '../../config/model';
import { cloudbaseTemplateConfig } from '../../config/index';
import { CART_ITEM, SKU, createId } from '../cloudbaseMock/index';

const CART_ITEM_MODEL_KEY = DATA_MODEL_KEY.CART_ITEM;

/**
 * 获取当前登录用户ID
 * @returns {string|null} 用户ID
 */
function getCurrentUserId() {
  const userInfo = wx.getStorageSync('userInfo');
  return userInfo && userInfo._id ? userInfo._id : null;
}

/** 获取购物车mock数据 */
function mockFetchCartGroupData(params) {
  const { delay } = require('../_utils/delay');
  const { genCartGroupData } = require('../../model/cart');

  return delay().then(() => genCartGroupData(params));
}

/**
 *
 * @param {{id: string}} param0
 * @returns
 */
export async function getCartItem({ id }) {
  if (cloudbaseTemplateConfig.useMock) {
    const cartItem = CART_ITEM.find((x) => x._id === id);
    cartItem.sku = SKU.find((sku) => sku._id === cartItem.sku._id);
    return { data: cartItem };
  }

  return model()[CART_ITEM_MODEL_KEY].get({
    filter: {
      where: {
        _id: {
          $eq: id,
        },
      },
    },
    select: {
      _id: true,
      count: true,
      sku: {
        _id: true,
        count: true,
        description: true,
      },
    },
  });
}

/**
 * 获取当前用户的购物车项列表
 * @returns {Promise<Array>} 购物车项列表
 */
export async function fetchCartItems() {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.log('用户未登录，返回空购物车');
    return [];
  }

  if (cloudbaseTemplateConfig.useMock) {
    // 过滤当前用户的购物车项
    return CART_ITEM.filter(item => item.user && item.user._id === userId)
      .map((cartItem) => {
        const sku = SKU.find((x) => x._id === cartItem.sku._id);
        return {
          ...cartItem,
          sku,
        };
      });
  }

  return getAll({
    name: CART_ITEM_MODEL_KEY,
    filter: {
      where: {
        user: {
          $eq: userId
        }
      }
    },
    select: {
      _id: true,
      count: true,
      sku: {
        _id: true,
        count: true,
        description: true,
      },
    },
  });
}

/**
 * 创建购物车项
 * @param {{
 *   skuId: String,
 *   count: Number
 * }} param0
 */
export async function createCartItem({ skuId, count }) {
  const userId = getCurrentUserId();
  if (!userId) {
    console.error('用户未登录，无法添加购物车');
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return Promise.reject(new Error('用户未登录'));
  }
  if (cloudbaseTemplateConfig.useMock) {
    // 检查当前用户是否已有相同商品在购物车中
    const existingItem = CART_ITEM.find(item => 
      item.sku._id === skuId && item.user && item.user._id === userId
    );
    if (existingItem) {
      // 如果已存在，更新数量
      existingItem.count += count;
    } else {
      // 添加新项目到购物车
      CART_ITEM.push({ 
        sku: { _id: skuId }, 
        count, 
        _id: createId(),
        user: { _id: userId }
      });
    }
    return;
  }
  // 检查是否已存在相同商品
  const cartItems = await getAll({
    name: CART_ITEM_MODEL_KEY,
    filter: {
      where: {
        sku: {
          $eq: skuId
        },
        user: {
          $eq: userId
        }
      }
    }
  });
  if (cartItems && cartItems.length > 0) {
    // 已存在则更新数量
    const cartItemId = cartItems[0]._id;
    const newCount = cartItems[0].count + count;
    return await updateCartItemCount({ cartItemId, count: newCount });
  } else {
    // 否则创建新项目
    return await model()[CART_ITEM_MODEL_KEY].create({
      data: {
        count,
        sku: { _id: skuId },
        user: { _id: userId }
      },
    });
  }
}

/**
 * 删除购物车项
 * @param {{cartItemId: string}} param0
 */
export async function deleteCartItem({ cartItemId }) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.error('用户未登录，无法删除购物车项');
    return;
  }

  if (cloudbaseTemplateConfig.useMock) {
    const index = CART_ITEM.findIndex(
      (cartItem) => cartItem._id === cartItemId && cartItem.user && cartItem.user._id === userId
    );
    
    if (index !== -1) {
      CART_ITEM.splice(index, 1);
    }
    return;
  }
  
  return await model()[CART_ITEM_MODEL_KEY].delete({
    filter: {
      where: {
        _id: {
          $eq: cartItemId,
        },
        user: {
          $eq: userId
        }
      },
    },
  });
}

/**
 * 更新购物车项数量
 * @param {{
 *   cartItemId: String,
 *   count: Number
 * }} param0
 * @returns
 */
export async function updateCartItemCount({ cartItemId, count }) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.error('用户未登录，无法更新购物车');
    return;
  }

  if (cloudbaseTemplateConfig.useMock) {
    const cartItem = CART_ITEM.find(
      (x) => x._id === cartItemId && x.user && x.user._id === userId
    );
    
    if (cartItem) {
      cartItem.count = count;
    }
    return;
  }
  
  return await model()[CART_ITEM_MODEL_KEY].update({
    data: {
      count,
    },
    filter: {
      where: {
        _id: {
          $eq: cartItemId,
        },
        user: {
          $eq: userId
        }
      },
    },
  });
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (config.useMock) {
    return mockFetchCartGroupData(params);
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}
