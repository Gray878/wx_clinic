import Toast from 'tdesign-miniprogram/toast/index';
import { fetchUserCoupons } from '../../../services/coupon/coupon';
import { resolveCoupon, rejectCoupon } from '../../../pages/coupon/util';

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
    selectMode: false, // 是否为选择模式
  },

  /**
   * 如果是 true 的话，点击后会选中并返回上一页；否则点击无反应
   */
  selectMode: false,
  /** 是否已经选择优惠券，不置为 true 的话页面离开时会触发取消选择行为 */
  hasSelect: false,

  onLoad(query) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '我的优惠券'
    });
    
    // 判断是否为选择模式
    const { selectMode } = query;
    this.selectMode = selectMode === 'true';
    this.setData({ selectMode: this.selectMode });
    
    this.fetchCouponList();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.fetchCouponList();
  },
  
  onUnload() {
    // 如果是选择模式且用户没有选择，触发取消选择
    if (this.selectMode && !this.hasSelect) {
      rejectCoupon();
    }
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
      
      // 预处理时间格式
      list.forEach(item => {
        if (item.coupon && item.coupon.endTime) {
          const date = new Date(item.coupon.endTime);
          item.coupon.endTimeFormatted = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        }
        if (item.useTime) {
          const date = new Date(item.useTime);
          item.useTimeFormatted = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        }
      });
      
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
  
  // 选择优惠券
  selectCoupon(e) {
    // 只有在选择模式下才进行选择操作
    if (!this.selectMode) return;
    
    const { id } = e.currentTarget.dataset;
    const selectedCoupon = this.data.couponList.find(item => item._id === id);
    
    if (selectedCoupon) {
      // 设置已选择标记
      this.hasSelect = true;
      // 将选中的优惠券传回上一页
      resolveCoupon(selectedCoupon);
      // 返回上一页
      wx.navigateBack({ delta: 1 });
    }
  }
}); 