import Toast from 'tdesign-miniprogram/toast/index';
import { createOrderItem } from '../../../services/order/orderItem';
import { createOrder, ORDER_STATUS, updateOrderStatus } from '../../../services/order/order';
import { getCartItem, deleteCartItem } from '../../../services/cart/cart';
import { getSkuDetail, updateSku } from '../../../services/sku/sku';
import { getAddressPromise } from '../../usercenter/address/list/util';
import { getSingleCloudImageTempUrl } from '../../../utils/cloudImageHandler';
import { cartShouldFresh } from '../../../utils/cartFresh';
import { pay } from '../../../services/pay/pay';
import { createCouponPromise } from '../../coupon/util';

const stripeImg = `https://cdn-we-retail.ym.tencent.com/miniapp/order/stripe.png`;

async function createOrderItemFromSku({ count, orderId, skuId }) {
  const latestSku = await getSkuDetail(skuId);
  const finalCount = latestSku.count - count;

  // check if sku is enough
  if (finalCount < 0) {
    return Promise.reject({ reason: 'SKU_NOT_ENOUGH' });
  }

  try {
    // decrease sku's count
    await updateSku({
      skuId,
      data: {
        count: finalCount,
      },
    });
    try {
      // create order item
      await createOrderItem({ count, orderId, skuId });
    } catch (e) {
      console.error(e);
      return Promise.reject({ reason: 'CREATE_ORDER_ITEM_FAILED' });
    }
  } catch (e) {
    console.error(e);
    return Promise.reject({ reason: 'SKU_DECREASE_FAILED' });
  }
}

/**
 *
 * @param {Object} cartItem
 * @param {String} orderId
 */
function createOrderItemFromCartItem(cartItem, orderId) {
  return createOrderItemFromSku({ count: cartItem.count, orderId, skuId: cartItem.sku._id });
}

/**
 *
 * @param {Array} cartItems
 */
function cartItemToGoodList(cartItems) {
  return cartItems.map((item) => ({
    thumb: item.sku.image,
    title: item.sku.spu.name,
    specs: item.sku.attr_value.map((v) => v.value).join('，'),
    price: item.sku.price,
    num: item.count,
  }));
}

Page({
  data: {
    placeholder: '备注信息',
    stripeImg,
    loading: true,
    orderCardList: [], // 仅用于商品卡片展示
    goodsRequestList: [],
    userAddressReq: null,
    storeInfoList: [],
    promotionGoodsList: [], //当前门店商品列表(优惠券)
    currentStoreId: null, //当前优惠券storeId
    userAddress: null,
    goodsList: [],
    cartItems: [],
    totalSalePrice: 0,
    directSku: null,
    selectedCoupon: null,
    couponDiscountAmount: 0, // 优惠券折扣金额
  },

  payLock: false,

  type: null,

  async onLoadFromCart(cartIds) {
    if (typeof cartIds !== 'string') {
      console.error('invalid cart item ids', cartIds);
      this.failedAndBack('获取购物车信息失败');
      return;
    }
    const ids = cartIds.split(',');
    try {
      const cartItems = await Promise.all(
        ids.map(async (id) => {
          const cartItem = (await getCartItem({ id })).data;
          cartItem.sku = { ...cartItem.sku, ...(await getSkuDetail(cartItem.sku._id)) };
          cartItem.sku.image = await getSingleCloudImageTempUrl(cartItem.sku.image);
          return cartItem;
        }),
      );
      const goodsList = cartItemToGoodList(cartItems);
      const totalSalePrice = goodsList.reduce((acc, cur) => acc + cur.price * cur.num, 0);
      this.setData({
        goodsList,
        totalSalePrice,
        cartItems,
      });
    } catch (e) {
      this.failedAndBack('获取购物车信息失败', e);
    }
  },
  async onLoadFromDirect(countStr, skuId) {
    const count = parseInt(countStr);
    if (typeof count !== 'number' || isNaN(count) || typeof skuId !== 'string') {
      console.error('invalid cunt or skiId', count, skuId);
      this.failedAndBack('初始化信息有误');
      return;
    }

    try {
      const sku = await getSkuDetail(skuId);
      sku.image = await getSingleCloudImageTempUrl(sku.image);

      const goodsList = [
        {
          thumb: sku.image,
          title: sku.spu.name,
          specs: sku.attr_value.map((v) => v.value).join('，'),
          price: sku.price,
          num: count,
        },
      ];

      const totalSalePrice = goodsList.reduce((acc, cur) => acc + cur.price * cur.num, 0);
      this.setData({
        goodsList,
        totalSalePrice,
        directSku: sku,
      });
    } catch (e) {
      this.failedAndBack('获取商品信息失败', e);
    }
  },

  async onLoad(options) {
    this.type = options?.type;
    if (this.type === 'cart') {
      await this.onLoadFromCart(options?.cartIds);
    } else if (this.type === 'direct') {
      await this.onLoadFromDirect(options?.count, options?.skuId);
    } else {
      this.failedAndBack('初始化信息有误', 'invalid type');
    }

    this.setData({
      loading: false,
    });
  },

  init() {
    this.setData({
      loading: false,
    });
    const { goodsRequestList } = this;
    this.handleOptionsParams({ goodsRequestList });
  },

  toast(message) {
    Toast({
      context: this,
      selector: '#t-toast',
      message,
      duration: 1000,
      icon: '',
    });
  },

  onGotoAddress() {
    /** 获取一个Promise */
    getAddressPromise()
      .then((address) => {
        this.setData({
          userAddress: {
            ...address,
            detailAddress: address.address,
          },
        });
      })
      .catch(() => {});

    wx.navigateTo({
      url: `/pages/usercenter/address/list/index?selectMode=true`,
    });
  },
  onTap() {
    this.setData({
      placeholder: '',
    });
  },

  async payImpl(totalPrice, orderId) {
    try {
      await pay({ id: orderId, totalPrice });
      try {
        await updateOrderStatus({ orderId, status: ORDER_STATUS.TO_SEND });
        this.toast('支付成功');
      } catch (e) {
        console.error(e);
        this.toast('支付成功，但订单状态更新失败');
      } finally {
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }
    } catch (e) {
      this.failedAndBack('支付失败', e);
    }
  },

  async submitOrderFromCart() {
    /**
     * 1.创建订单
     * 2.创建订单项
     * 3.删除购物车项
     */

    const { cartItems, userAddress } = this.data;
    const { id: orderId } = await createOrder({ status: ORDER_STATUS.TO_PAY, addressId: userAddress._id });

    try {
      await Promise.all(cartItems.map(async (cartItem) => {
        await createOrderItemFromCartItem(cartItem, orderId);
      }));

      try {
        await cartItems.map(async (cartItem) => {
          await deleteCartItem({ cartItemId: cartItem._id });
          // any deletion should notify cart to fresh
          cartShouldFresh();
        });
      } catch (e) {
        console.error(e);
        this.toast('删除购物车失败，请手动删除');
        // do not return, continue to pay
      }

      const totalPrice = cartItems.reduce((acc, cur) => acc + cur.count * cur.sku.price, 0);
      await this.payImpl(totalPrice, orderId);
    } catch (e) {
      this.failedAndBack('创建订单失败', e);
    }
  },

  async submitOrderFromDirect() {
    /**
     * 1.创建订单
     * 2.创建订单项
     */

    const { directSku, userAddress, goodsList } = this.data;
    const goods = goodsList[0];
    const { id: orderId } = await createOrder({ status: ORDER_STATUS.TO_PAY, addressId: userAddress._id });

    try {
      await createOrderItemFromSku({ count: goods.num, orderId, skuId: directSku._id });
      const totalPrice = goods.price * goods.num;

      await this.payImpl(totalPrice, orderId);
    } catch (e) {
      this.failedAndBack('创建订单失败', e);
    }
  },

  failedAndBack(message, e) {
    e && console.error(e);
    this.toast(message);
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  // 提交订单
  async submitOrder() {
    const { userAddress } = this.data;
    if (!userAddress) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请添加收货地址',
        duration: 2000,
        icon: 'help-circle',
      });
      return;
    }

    if (this.type === 'cart') {
      this.submitOrderFromCart();
    } else if (this.type === 'direct') {
      this.submitOrderFromDirect();
    } else {
      console.error('invalid type', this.type);
      this.failedAndBack('初始化信息有误');
    }
  },

  // 选择优惠券
  onSelectCoupon() {
    wx.navigateTo({
      url: '/packageCoupon/pages/coupon/index?selectMode=true'
    });
    
    // 创建Promise等待用户选择优惠券
    createCouponPromise().then(selectedCoupon => {
      console.log('用户选择的优惠券:', selectedCoupon);
      
      // 先验证是否满足最低消费金额要求
      if (selectedCoupon && selectedCoupon.coupon && selectedCoupon.coupon.minConsume > 0) {
        if (this.data.totalSalePrice < selectedCoupon.coupon.minConsume) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: `订单金额不满${selectedCoupon.coupon.minConsume}元，无法使用该优惠券`,
            icon: '',
          });
          return;
        }
      }
      
      // 计算优惠券折扣金额
      let discountAmount = 0;
      if (selectedCoupon && selectedCoupon.coupon) {
        // 根据优惠券类型计算折扣金额
        switch (selectedCoupon.coupon.type) {
          case 1: // 满减券
            discountAmount = selectedCoupon.coupon.amount;
            break;
          case 2: // 折扣券
            // 折扣券金额 = 商品总价 × (1 - 折扣率)
            discountAmount = this.data.totalSalePrice * (1 - selectedCoupon.coupon.amount);
            
            // 如果有最高优惠限制，则应用最高优惠金额
            if (selectedCoupon.coupon.maxDiscountAmount && 
                discountAmount > selectedCoupon.coupon.maxDiscountAmount) {
              discountAmount = selectedCoupon.coupon.maxDiscountAmount;
            }
            
            // 保留两位小数
            discountAmount = Math.round(discountAmount * 100) / 100;
            break;
          case 3: // 无门槛券
            discountAmount = selectedCoupon.coupon.amount;
            break;
          default:
            discountAmount = 0;
        }
      }
      
      // 更新订单数据
      this.setData({
        selectedCoupon: selectedCoupon,
        couponDiscountAmount: discountAmount,
        totalPayAmount: Math.max(0.01, this.data.totalSalePrice - discountAmount) // 确保最低支付0.01元
      });
      
      // 重新计算订单金额和优惠信息
      this.calcOrderAmount();
    }).catch(err => {
      console.log('用户取消选择优惠券', err);
    });
  },
  
  // 重新计算订单金额（包含优惠券折扣）
  calcOrderAmount() {
    // 计算优惠券折扣
    let finalAmount = this.data.totalSalePrice;
    if (this.data.selectedCoupon && this.data.couponDiscountAmount > 0) {
      finalAmount = Math.max(0.01, finalAmount - this.data.couponDiscountAmount);
    }
    
    this.setData({
      totalPayAmount: finalAmount
    });
  },
  
  // 移除已选优惠券
  removeCoupon() {
    this.setData({
      selectedCoupon: null,
      couponDiscountAmount: 0
    });
    
    // 重新计算订单金额
    this.calcOrderAmount();
  },
  
  // 创建订单时添加优惠券信息
  createOrder() {
    // ... 现有代码 ...
    
    // 添加优惠券信息到订单参数
    if (this.data.selectedCoupon) {
      submitParams.couponId = this.data.selectedCoupon._id;
    }
    
    // ... 提交订单逻辑 ...
  }
});
