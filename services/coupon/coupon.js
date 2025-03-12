import { model, getAll } from '../_utils/model';
import { config } from '../../config/index';
import { DATA_MODEL_KEY } from '../../config/model';
import { cloudbaseTemplateConfig } from '../../config/index';
import { createId } from '../cloudbaseMock/index';

const COUPON_MODEL_KEY = DATA_MODEL_KEY.COUPON;
const USER_COUPON_MODEL_KEY = DATA_MODEL_KEY.USER_COUPON;

/**
 * 获取当前登录用户ID
 * @returns {string|null} 用户ID
 */
function getCurrentUserId() {
  const userInfo = wx.getStorageSync('userInfo');
  return userInfo && userInfo._id ? userInfo._id : null;
}

/**
 * 获取用户优惠券列表
 * @param {number} status - 优惠券状态：1-未使用，2-已使用，3-已过期
 * @returns {Promise<Array>} 优惠券列表
 */
export async function fetchUserCoupons(status = 1) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return [];
  }

  if (cloudbaseTemplateConfig.useMock) {
    // 使用model/coupon.js中的模拟数据
    const { getCouponList } = require('../../model/coupon');
    const statusMap = {
      1: 'default',
      2: 'useless',
      3: 'disabled'
    };
    return getCouponList(statusMap[status] || 'default');
  }

  try {
    // 从数据库获取用户优惠券
    const result = await model()[USER_COUPON_MODEL_KEY].list({
      filter: {
        where: {
          user: { $eq: userId },
          status: { $eq: status }
        },
        relateWhere: {
          coupon: {
            where: {}
          }
        }
      },
      select: {
        _id: true,
        status: true,
        receiveTime: true,
        useTime: true,
        expireTime: true,
        coupon: {
          _id: true,
          name: true,
          type: true,
          amount: true,
          minConsume: true,
          description: true,
          startTime: true,
          endTime: true,
          status: true
        }
      },
      orderBy: [{ expireTime: 'asc' }]
    });
    
    return result.data?.records || [];
  } catch (error) {
    console.error('获取优惠券列表失败', error);
    return [];
  }
}

/**
 * 获取优惠券详情
 * @param {string} couponId - 优惠券ID
 * @returns {Promise<Object>} 优惠券详情
 */
export async function getCouponDetail(couponId) {
  if (!couponId) return null;
  
  try {
    const result = await model()[USER_COUPON_MODEL_KEY].get({
      filter: {
        where: { _id: { $eq: couponId } },
        relateWhere: {
          coupon: { where: {} }
        }
      },
      select: {
        _id: true,
        status: true,
        receiveTime: true,
        useTime: true,
        expireTime: true,
        coupon: {
          _id: true,
          name: true,
          type: true,
          amount: true,
          minConsume: true,
          description: true,
          startTime: true,
          endTime: true,
          status: true
        }
      }
    });
    
    return result.data;
  } catch (error) {
    console.error('获取优惠券详情失败', error);
    return null;
  }
}

/**
 * 获取可领取的优惠券列表
 * @returns {Promise<Array>} 可领取的优惠券列表
 */
export async function fetchAvailableCoupons() {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return [];
  }

  if (cloudbaseTemplateConfig.useMock) {
    // 使用model/coupon.js中的模拟数据
    const { getCouponList } = require('../../model/coupon');
    return getCouponList('default', 5);
  }

  try {
    const currentTime = new Date().getTime();
    
    // 获取所有可用的优惠券
    const result = await model()[COUPON_MODEL_KEY].list({
      filter: {
        where: {
          status: { $eq: 1 },
          startTime: { $lte: currentTime },
          endTime: { $gte: currentTime },
          stock: { $gt: 0 }
        }
      },
      select: {
        _id: true,
        name: true,
        type: true,
        amount: true,
        minConsume: true,
        description: true,
        startTime: true,
        endTime: true
      }
    });
    
    // 获取用户已领取的优惠券ID列表
    const userCoupons = await model()[USER_COUPON_MODEL_KEY].list({
      filter: {
        where: {
          user: { $eq: userId }
        },
        relateWhere: {
          coupon: {
            where: {}
          }
        }
      },
      select: {
        coupon: {
          _id: true
        }
      }
    });
    
    const userCouponIds = userCoupons.data?.records.map(item => item.coupon._id) || [];
    
    // 过滤掉用户已领取的优惠券
    const availableCoupons = result.data?.records.filter(coupon => 
      !userCouponIds.includes(coupon._id)
    ) || [];
    
    return availableCoupons;
  } catch (error) {
    console.error('获取可领取优惠券列表失败', error);
    return [];
  }
}

/**
 * 领取优惠券
 * @param {string} couponId - 优惠券ID
 * @returns {Promise<boolean>} 是否领取成功
 */
export async function receiveCoupon(couponId) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.error('用户未登录，无法领取优惠券');
    return false;
  }

  if (cloudbaseTemplateConfig.useMock) {
    return true; // 模拟领取成功
  }

  try {
    // 查询优惠券信息
    const couponResult = await model()[COUPON_MODEL_KEY].get({
      filter: {
        where: {
          _id: { $eq: couponId }
        }
      },
      select: {
        _id: true,
        endTime: true,
        stock: true,
        status: true
      }
    });
    
    const coupon = couponResult.data;
    
    // 检查优惠券是否可领取
    if (!coupon || coupon.status !== 1 || coupon.stock <= 0) {
      console.log('优惠券不可领取');
      return false;
    }
    
    // 检查用户是否已领取过该优惠券
    const userCouponResult = await model()[USER_COUPON_MODEL_KEY].list({
      filter: {
        where: {
          user: { $eq: userId },
          coupon: { $eq: couponId }
        }
      },
      select: {
        _id: true
      }
    });
    
    if (userCouponResult.data?.records.length > 0) {
      console.log('用户已领取过该优惠券');
      return false;
    }
    
    // 创建用户优惠券记录
    const currentTime = new Date().getTime();
    await model()[USER_COUPON_MODEL_KEY].create({
      data: {
        user: { _id: userId },
        coupon: { _id: couponId },
        status: 1, // 未使用
        receiveTime: currentTime,
        expireTime: coupon.endTime
      }
    });
    
    // 更新优惠券库存
    await model()[COUPON_MODEL_KEY].update({
      data: {
        stock: coupon.stock - 1
      },
      filter: {
        where: {
          _id: { $eq: couponId }
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('领取优惠券失败', error);
    return false;
  }
}

/**
 * 使用优惠券
 * @param {string} couponId - 用户优惠券ID
 * @param {string} orderId - 订单ID
 * @returns {Promise<boolean>} 是否使用成功
 */
export async function useCoupon(couponId, orderId) {
  if (!couponId || !orderId) return false;
  
  try {
    // 更新优惠券状态为已使用
    await model()[USER_COUPON_MODEL_KEY].update({
      data: {
        status: 2, // 已使用
        useTime: Date.now(),
        order: { _id: orderId }
      },
      filter: {
        where: { _id: { $eq: couponId } }
      }
    });
    
    return true;
  } catch (error) {
    console.error('使用优惠券失败', error);
    return false;
  }
}

/**
 * 检查优惠券是否可用于特定订单
 * @param {string} couponId - 优惠券ID
 * @param {number} orderAmount - 订单金额
 * @returns {Promise<{isValid: boolean, message: string}>} 校验结果
 */
export async function checkCouponValidity(couponId, orderAmount) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return { isValid: false, message: '用户未登录' };
  }

  if (cloudbaseTemplateConfig.useMock) {
    // 模拟校验逻辑
    if (orderAmount < 10000) {
      return { isValid: false, message: '订单金额不满足优惠券使用条件' };
    }
    return { isValid: true, message: '优惠券可用' };
  }

  try {
    // 获取用户优惠券信息
    const userCouponResult = await model()[USER_COUPON_MODEL_KEY].get({
      filter: {
        where: {
          _id: { $eq: couponId },
          user: { $eq: userId },
          status: { $eq: 1 } // 未使用
        },
        relateWhere: {
          coupon: {
            where: {}
          }
        }
      },
      select: {
        expireTime: true,
        coupon: {
          _id: true,
          minConsume: true,
          type: true,
          amount: true,
          status: true
        }
      }
    });
    
    const userCoupon = userCouponResult.data;
    
    if (!userCoupon) {
      return { isValid: false, message: '优惠券不存在' };
    }
    
    // 检查优惠券是否过期
    const currentTime = new Date().getTime();
    if (currentTime > userCoupon.expireTime) {
      return { isValid: false, message: '优惠券已过期' };
    }
    
    // 检查优惠券状态
    if (userCoupon.coupon.status !== 1) {
      return { isValid: false, message: '优惠券已停用' };
    }
    
    // 检查最低消费金额
    if (userCoupon.coupon.minConsume > orderAmount) {
      return { 
        isValid: false, 
        message: `订单金额需满${userCoupon.coupon.minConsume/100}元才能使用` 
      };
    }
    
    return { isValid: true, message: '优惠券可用' };
  } catch (error) {
    console.error('检查优惠券有效性失败', error);
    return { isValid: false, message: '系统错误' };
  }
}

/**
 * 获取用户优惠券列表
 * @param {number} status - 优惠券状态：1-未使用，2-已使用，3-已过期
 * @returns {Promise<Array>} 优惠券列表
 */
export async function fetchUserCouponsAlternative(status = 1) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return [];
  }

  if (cloudbaseTemplateConfig.useMock) {
    // 使用模拟数据...
  }

  try {
    // 第一步：获取用户优惠券记录
    const userCouponsResult = await model()[USER_COUPON_MODEL_KEY].list({
      filter: {
        where: {
          user: { $eq: userId },
          status: { $eq: status }
        }
      },
      select: {
        _id: true,
        status: true,
        receiveTime: true,
        useTime: true,
        expireTime: true,
        coupon: true  // 只获取优惠券ID
      }
    });
    
    const userCoupons = userCouponsResult.data?.records || [];
    if (userCoupons.length === 0) return [];
    
    // 提取所有优惠券ID
    const couponIds = userCoupons.map(uc => uc.coupon);
    
    // 第二步：获取优惠券详情
    const couponsResult = await model()[COUPON_MODEL_KEY].list({
      filter: {
        where: {
          _id: { $in: couponIds }
        }
      }
    });
    
    const coupons = couponsResult.data?.records || [];
    
    // 合并数据
    return userCoupons.map(uc => {
      const couponDetail = coupons.find(c => c._id === uc.coupon);
      return {
        ...uc,
        coupon: couponDetail || {}
      };
    });
  } catch (error) {
    console.error('获取优惠券列表失败', error);
    return [];
  }
} 