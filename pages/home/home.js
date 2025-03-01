/* eslint-disable no-param-reassign */
import { getHomeSwiper } from '../../services/home/home';
import { listGood, getPrice } from '../../services/good/spu';
import { getCloudImageTempUrl } from '../../utils/cloudImageHandler';
import { LIST_LOADING_STATUS } from '../../utils/listLoading';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: LIST_LOADING_STATUS.READY,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: { type: 'dots' },
    swiperImageProps: { mode: 'scaleToFill' },
    currentCity: '广州'
  },

  goodListPagination: {
    index: 1,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init();
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === LIST_LOADING_STATUS.READY) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  async init() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: false,
    });

    this.loadGoodsList(true);
    this.loadHomeSwiper();
  },

  async loadHomeSwiper() {
    try {
      const { images } = await getHomeSwiper();
      const handledImages = await getCloudImageTempUrl(images);
      this.setData({ imgSrcs: handledImages });
    } catch (error) {
      console.error('加载轮播图失败', error);
      // 设置默认轮播图
      this.setData({
        imgSrcs: [{
          img: 'https://cdn-we-retail.ym.tencent.com/miniapp/home/banner1.png',
          type: 'image'
        }]
      });
    }
  },

  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({ goodsListLoadStatus: LIST_LOADING_STATUS.LOADING });

    const pageSize = this.goodListPagination.num;
    const pageIndex = fresh ? 1 : this.goodListPagination.index;

    try {
      const { records: nextList, total } = await listGood({ pageNumber: pageIndex, pageSize });
      const images = nextList.map((x) => x.cover_image);
      const handledImages = await getCloudImageTempUrl(images);
      handledImages.forEach((image, index) => (nextList[index].cover_image = image));
      await Promise.all(nextList.map(async (spu) => (spu.price = await getPrice(spu._id).catch(() => 0.01))));

      const goodsList = fresh ? nextList : this.data.goodsList.concat(nextList);

      this.setData({
        goodsList,
        goodsListLoadStatus: goodsList.length >= total ? LIST_LOADING_STATUS.NO_MORE : LIST_LOADING_STATUS.READY,
      });

      this.goodListPagination.index = pageIndex + 1;
      this.goodListPagination.num = pageSize;
    } catch (err) {
      console.error('error', err);
      this.setData({ goodsListLoadStatus: LIST_LOADING_STATUS.FAILED });
    }
  },

  goodListClickHandle(e) {
    const spuId = e?.detail?.goods?._id;
    if (typeof spuId !== 'string') return;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  goodListAddCartHandle(e) {
    const spuId = e?.detail?.goods?._id;
    if (typeof spuId !== 'string') return;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  navToSearchPage() {
    wx.navigateTo({ url: '/pages/goods/search/index' });
  },

  // 城市选择
  selectCity(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      currentCity: city
    });
    
    // 这里可以根据选择的城市加载相应的服务或其他数据
    Toast({
      context: this,
      selector: '#t-toast',
      message: `已选择${city}`,
      icon: '',
      duration: 1000,
    });
  }
});
