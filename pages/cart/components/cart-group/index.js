import Toast from 'tdesign-miniprogram/toast/index';

const shortageImg = 'https://cdn-we-retail.ym.tencent.com/miniapp/cart/shortage.png';

Component({
  isSpecsTap: false, // 标记本次点击事件是否因为点击specs触发（由于底层goods-card组件没有catch specs点击事件，只能在此处加状态来避免点击specs时触发跳转商品详情）
  externalClasses: ['wr-class'],
  properties: {
    storeGoods: {
      type: Array,
      observer(storeGoods) {
        for (const store of storeGoods) {
          for (const activity of store.promotionGoodsList) {
            for (const goods of activity.goodsPromotionList) {
              goods.specs = goods.specInfo.map((item) => item.specValue); // 目前仅展示商品已选规格的值
            }
          }
          for (const goods of store.shortageGoodsList) {
            goods.specs = goods.specInfo.map((item) => item.specValue); // 目前仅展示商品已选规格的值
          }
        }

        this.setData({ _storeGoods: storeGoods });
      },
    },
    invalidGoodItems: {
      type: Array,
      observer(invalidGoodItems) {
        invalidGoodItems.forEach((goods) => {
          goods.specs = goods.specInfo.map((item) => item.specValue); // 目前仅展示商品已选规格的值
        });
        this.setData({ _invalidGoodItems: invalidGoodItems });
      },
    },
    thumbWidth: { type: null },
    thumbHeight: { type: null },
    cartItems: { type: Array },
  },

  data: {
    shortageImg,
    isShowSpecs: false,
    currentGoods: null,
    isShowToggle: false,
    _storeGoods: [],
    _invalidGoodItems: [],
  },

  methods: {
    toast(message) {
      Toast({
        context: this,
        selector: '#t-toast',
        message,
      });
    },
    // 删除商品
    deleteGoods(e) {
      const { goods } = e.currentTarget.dataset;
      this.triggerEvent('delete', { goods });
    },

    // 清空失效商品
    clearInvalidGoods() {
      this.triggerEvent('clearinvalidgoods');
    },

    // 选中商品
    selectGoods(e) {
      const { goods } = e.currentTarget.dataset;
      this.triggerEvent('selectgoods', {
        goods,
      });
    },

    changeQuantity(count, cartItemId) {
      this.triggerEvent('changequantity', {
        count,
        cartItemId,
      });
    },
    changeStepper({
      detail: { value: changeToValue },
      target: {
        dataset: { goods },
      },
    }) {
      // validation is handled by this.overlimit()
      this.changeQuantity(changeToValue, goods._id);
    },

    input(e) {
      const { value } = e.detail;
      const { goods } = e.currentTarget.dataset;
      const num = value;
      this.changeQuantity(num, goods);
    },

    overlimit(e) {
      const text = e.detail.type === 'minus' ? '不能再少了' : '不能再多了';
      this.toast(text);
    },

    // 去凑单/再逛逛
    gotoBuyMore(e) {
      const { promotion, storeId = '' } = e.currentTarget.dataset;
      this.triggerEvent('gocollect', { promotion, storeId });
    },

    // 选中门店
    selectStore(e) {
      const { storeIndex } = e.currentTarget.dataset;
      const store = this.data.storeGoods[storeIndex];
      const isSelected = !store.isSelected;
      if (store.storeStockShortage && isSelected) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '部分商品库存不足',
        });
        return;
      }
      this.triggerEvent('selectstore', {
        store,
        isSelected,
      });
    },

    // 展开/收起切换
    showToggle() {
      this.setData({
        isShowToggle: !this.data.isShowToggle,
      });
    },

    // 展示规格popup
    specsTap({
      target: {
        dataset: { goods },
      },
    }) {
      this.isSpecsTap = true;
      this.setData({
        isShowSpecs: true,
        currentGoods: goods,
      });
    },

    hideSpecsPopup() {
      this.setData({
        isShowSpecs: false,
      });
    },

    goGoodsDetail(e) {
      if (this.isSpecsTap) {
        this.isSpecsTap = false;
        return;
      }
      const { goods } = e.currentTarget.dataset;
      this.triggerEvent('goodsclick', { goods });
    },

    gotoCoupons() {
      wx.navigateTo({ url: '/packageCoupon/pages/coupon/coupon-list/index' });
    },
  },
});
