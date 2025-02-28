import Toast from 'tdesign-miniprogram/toast/index';
import { getCates } from '../../../services/cate/cate';

Page({
  data: {
    cates: [],
  },
  async init() {
    try {
      const cates = await getCates();
      this.setData({ cates });
    } catch (e) {
      console.error('获取商品分类列表失败', e);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '获取商品分类列表失败',
        duration: 1000,
        icon: '',
      });
    }
  },

  navToSearchPage() {
    wx.navigateTo({
      url: '/pages/goods/search/index'
    });
  },

  onChange(e) {
    const { detail } = e;
    if (detail.tabIndex == 0) {
      return;
    }
    const { value, label } = detail;
    wx.navigateTo({
      url: `/pages/goods/list/index?categoryId=${value}&categoryName=${label}`,
    });
  },

  onShow() {
    this.getTabBar().init();
  },
  onLoad() {
    this.init(true);
  },
});
