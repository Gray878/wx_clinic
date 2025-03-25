import Toast from 'tdesign-miniprogram/toast/index';
import { fetchUserCoupons } from '../../../services/coupon/coupon';

Page({
  data: {
    tabList: [
      { text: '未使用', key: 1, count: 0 },
      { text: '已使用', key: 2, count: 0 },
      { text: '已失效', key: 3, count: 0 }
    ],
    currentTab: 1,
    couponList: [],
    loading: false,
    isEmpty: false,
  },

  onLoad() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '我的优惠券'
    });
    this.fetchCouponList();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.fetchCouponList();
  },

  onPullDownRefresh() {
    this.fetchCouponList(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 切换标签页
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    if (tab === this.data.currentTab) return;
    
    this.setData({
      currentTab: tab,
      couponList: [],
    });
    this.fetchCouponList();
  },

  // 获取优惠券列表
  async fetchCouponList(callback) {
    try {
      this.setData({ loading: true });
      
      // 获取当前用户ID
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo || !userInfo._id) {
        this.setData({ 
          isEmpty: true,
          loading: false,
          couponList: []
        });
        if (callback) callback();
        return;
      }
      
      // 获取所有状态的优惠券数量
      const promises = [1, 2, 3].map(status => fetchUserCoupons(status));
      const results = await Promise.all(promises);
      
      // 更新标签页计数
      const tabList = this.data.tabList.map((tab, index) => ({
        ...tab,
        count: results[index].length
      }));
      
      // 获取当前选项卡的优惠券列表
      const list = results[this.data.currentTab - 1];
      
      this.setData({
        tabList,
        couponList: list,
        isEmpty: list.length === 0,
        loading: false
      });
      
      if (callback) callback();
    } catch (error) {
      console.error('获取优惠券列表异常', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '获取优惠券列表失败',
        icon: 'error',
      });
      this.setData({
        isEmpty: true,
        loading: false
      });
      if (callback) callback();
    }
  },
  
  // 使用优惠券（跳转到商品列表）
  onUseCoupon(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/goods/list/index?couponId=${id}`,
    });
  },
  
  // 查看优惠券详情
  onViewCouponDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/packageCoupon/pages/coupon/coupon-detail/index?id=${id}`,
    });
  }
}); 