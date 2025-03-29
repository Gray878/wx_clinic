// 使用Promise实现优惠券选择的通信机制
let couponPromise = null;
let promiseResolve = null;
let promiseReject = null;

// 创建优惠券选择Promise
export const createCouponPromise = () => {
  // 如果已经存在Promise，先清除它
  if (couponPromise) {
    promiseReject('新的优惠券选择请求已创建');
  }
  
  couponPromise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });
  
  return couponPromise;
};

// 处理优惠券选择结果
export const resolveCoupon = (coupon) => {
  if (promiseResolve) {
    promiseResolve(coupon);
    couponPromise = null;
    promiseResolve = null;
    promiseReject = null;
  }
};

// 处理用户取消选择
export const rejectCoupon = () => {
  if (promiseReject) {
    promiseReject('用户取消选择优惠券');
    couponPromise = null;
    promiseResolve = null;
    promiseReject = null;
  }
}; 