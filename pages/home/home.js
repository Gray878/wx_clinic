/* eslint-disable no-param-reassign */
import { getHomeSwiper } from '../../services/home/home';
import { listGood, getPrice } from '../../services/good/spu';
import { getCloudImageTempUrl } from '../../utils/cloudImageHandler';
import { LIST_LOADING_STATUS } from '../../utils/listLoading';
import Toast from 'tdesign-miniprogram/toast/index';
// 导入城市服务
import { getAllCities, getDefaultCity } from '../../services/city/city';
// 导入医院服务
import { getFeaturedHospitals } from '../../services/hospital/hospital';

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
    currentCity: '全部',
    currentCityCode: '',
    cityList: [], // 城市列表数据
    hospitalList: [],
    showLoginPopup: false
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
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      this.setData({ showLoginPopup: true });
    }
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
      pageLoading: true,
    });

    // 加载城市数据并设置默认城市
    await this.loadCityData();
    this.loadGoodsList(true);
    this.loadHomeSwiper();
    this.loadHospitalList();
    
    this.setData({
      pageLoading: false,
    });
  },

  // 加载城市数据
  async loadCityData() {
    try {
      // 获取所有活跃城市
      const cityList = await getAllCities();
      
      if (cityList && cityList.length > 0) {
        this.setData({
          cityList: cityList,
          currentCity: '全部',
          currentCityCode: ''
        });
      } else {
        // 如果没有获取到城市数据，则使用默认值
        this.setData({
          cityList: [
            { _id: 'city-001', name: '广州', code: 'gz', is_active: true },
            { _id: 'city-002', name: '佛山', code: 'fs', is_active: true },
            { _id: 'city-003', name: '惠州', code: 'hz', is_active: true }
          ],
          currentCity: '全部',
          currentCityCode: ''
        });
      }
    } catch (error) {
      console.error('加载城市数据失败:', error);
      // 设置默认城市数据
      this.setData({
        cityList: [
          { _id: 'city-001', name: '广州', code: 'gz', is_active: true },
          { _id: 'city-002', name: '佛山', code: 'fs', is_active: true },
          { _id: 'city-003', name: '惠州', code: 'hz', is_active: true }
        ],
        currentCity: '全部',
        currentCityCode: ''
      });
    }
  },

  async loadHomeSwiper() {
    try {
      const res = await getHomeSwiper();
      console.log('轮播图数据:', res);
      
      // 确保有图片数据
      if (res && res.images && res.images.length > 0) {
        // 检查并处理每个图片项
        const processedImages = res.images.map(item => {
          // 确保图片链接存在
          if (!item.image) {
            console.warn('图片链接不存在:', item);
            return null;
          }
          return item;
        }).filter(item => item !== null);
        
        if (processedImages.length > 0) {
          this.setData({ imgSrcs: processedImages });
        } else {
          // 设置默认轮播图
          this.setDefaultSwiper();
        }
      } else {
        // 设置默认轮播图
        this.setDefaultSwiper();
      }
    } catch (error) {
      console.error('加载轮播图失败', error);
      // 设置默认轮播图
      this.setDefaultSwiper();
    }
  },

  // 设置默认轮播图
  setDefaultSwiper() {
    this.setData({
      imgSrcs: [{
        image: 'https://cdn-we-retail.ym.tencent.com/miniapp/home/banner1.png',
        title: '默认轮播图',
        url: '',
        img_url: ''
      }]
    });
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
      // 准备请求参数
      const params = { 
        pageNumber: pageIndex, 
        pageSize: pageSize
      };
      
      // 当选择了特定城市时，添加城市筛选参数
      if (this.data.currentCityCode) {
        params.server_city = this.data.currentCityCode;
      }
      
      // 使用服务端城市筛选
      const { records: nextList, total } = await listGood(params);
      
      const images = nextList.map((x) => x.cover_image);
      const handledImages = await getCloudImageTempUrl(images);
      handledImages.forEach((image, index) => (nextList[index].cover_image = image));
      
      // 处理icon_image，确保图标正确加载
      if (nextList.length > 0) {
        const iconImages = nextList.map(x => x.icon_image).filter(x => x);
        if (iconImages.length > 0) {
          const handledIconImages = await getCloudImageTempUrl(iconImages);
          let iconIndex = 0;
          for (let i = 0; i < nextList.length; i++) {
            if (nextList[i].icon_image) {
              nextList[i].icon_image = handledIconImages[iconIndex++];
            }
          }
        }
      }
      
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
    // 获取服务数据
    const goods = e.currentTarget.dataset.goods;
    const spuId = goods?._id;
    
    if (typeof spuId !== 'string') return;
    
    // 导航到服务详情页
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
    const cityCode = e.currentTarget.dataset.code;
    
    this.setData({
      currentCity: city,
      currentCityCode: cityCode,
      goodsList: [],  // 清空当前商品列表
      goodsListLoadStatus: LIST_LOADING_STATUS.LOADING
    });
    
    // 重新加载商品
    this.loadGoodsList(true);
    
    // 重新加载医院列表
    this.loadHospitalList();
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: city === '全部' ? '显示全部城市服务' : `已选择${city}`,
      icon: '',
      duration: 1000,
    });
  },
  
  // 加载医院列表
  async loadHospitalList() {
    // 获取当前选择的城市码
    const cityCode = this.data.currentCityCode;
    
    try {
      // 使用医院服务获取精选医院列表
      const hospitals = await getFeaturedHospitals(cityCode, 5);
      
      // 处理图片资源，获取临时URL
      if (hospitals && hospitals.length > 0) {
        const coverImages = hospitals.map(h => h.cover_image).filter(url => url);
        if (coverImages.length > 0) {
          const handledImages = await getCloudImageTempUrl(coverImages);
          // 更新cover_image
          let imgIndex = 0;
          for (let i = 0; i < hospitals.length; i++) {
            if (hospitals[i].cover_image) {
              hospitals[i].cover_image = handledImages[imgIndex++];
            }
          }
        }
      }
      
      // 更新数据
      this.setData({
        hospitalList: hospitals
      });
    } catch (error) {
      console.error('加载医院列表失败:', error);
      
      // 如果加载失败，使用本地模拟数据
      const mockHospitals = [
        {
          _id: 'hospital_001',
          name: '北京大学肿瘤医院',
          cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/beijingdaxuezhongliu.jpg',
          rating: 5,
          city_code: 'bj',
          city_name: '北京',
          location: { longitude: 116.2345, latitude: 39.5678 }
        },
        {
          _id: 'hospital_006',
          name: '广州中医药大学第一附属医院',
          cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/guangzhouzhongyiyao.jpg',
          rating: 5,
          city_code: 'gz',
          city_name: '广州',
          location: { longitude: 113.2345, latitude: 23.5678 }
        },
        {
          _id: 'hospital_007',
          name: '中山大学附属第一医院',
          cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/zhongshanyiyuan.jpg',
          rating: 5,
          city_code: 'gz',
          city_name: '广州',
          location: { longitude: 113.3456, latitude: 23.6789 }
        }
      ];
  
      // 根据选择的城市过滤
      const filteredHospitals = !cityCode 
        ? mockHospitals // 如果选择全部，则显示所有医院
        : mockHospitals.filter(h => h.city_code === cityCode);
  
      this.setData({
        hospitalList: filteredHospitals
      });
    }
  },
  
  // 医院点击处理
  hospitalClickHandle(e) {
    const hospital = e.currentTarget.dataset.hospital;
    if (!hospital || !hospital._id) return;
    
    wx.navigateTo({
      url: `/pages/hospital/detail/index?id=${hospital._id}`,
    });
  },
  
  // 导航到医院列表页
  navigateToHospitalList() {
    wx.navigateTo({
      url: `/pages/hospital/list/index?city=${this.data.currentCity}&cityCode=${this.data.currentCityCode}`,
    });
  },
  
  // 导航到医院
  navigateToHospital(e) {
    const hospital = e.currentTarget.dataset.hospital;
    if (!hospital || !hospital.location) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '无法获取医院位置信息',
        icon: 'error',
        duration: 1000,
      });
      return;
    }
    
    // 调用微信地图导航
    wx.openLocation({
      latitude: hospital.location.latitude,
      longitude: hospital.location.longitude,
      name: hospital.name,
      address: hospital.address || hospital.name,
      scale: 18
    });
  },

  // 处理登录
  async handleLogin() {
    try {
      // 获取用户信息
      const { userInfo } = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善会员资料',
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });

      // 获取code
      const { code } = await new Promise((resolve, reject) => {
        wx.login({
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });

      // 保存用户信息到本地
      wx.setStorageSync('userInfo', userInfo);
      
      // 更新全局状态
      getApp().globalData.isLoggedIn = true;
      
      // 登录成功
      this.setData({ 
        showLoginPopup: false,
      });
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      });
    }
  },

  // 关闭登录弹窗
  closeLoginPopup() {
    this.setData({ showLoginPopup: false });
  },

  // 处理轮播图点击
  onSwiperItemClick(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.imgSrcs[index];
    
    console.log('点击轮播图:', index, item);
    
    if (!item) {
      console.warn('轮播图项不存在');
      return;
    }
    
    // 检查是否有链接
    let targetUrl = '';
    if (item.url) {
      targetUrl = item.url;
    } else if (item.img_url) {
      targetUrl = item.img_url;
    }
    
    // 如果没有链接，不执行任何操作
    if (!targetUrl) {
      console.log('轮播图没有跳转链接');
      return;
    }
    
    console.log('准备跳转到:', targetUrl);
    
    // 判断链接类型并进行相应跳转
    if (targetUrl.startsWith('/pages/')) {
      // 内部页面跳转
      wx.navigateTo({
        url: targetUrl,
        fail: (err) => {
          console.error('页面跳转失败(navigateTo):', err);
          // 如果navigateTo失败，尝试switchTab
          wx.switchTab({
            url: targetUrl,
            fail: (switchErr) => {
              console.error('页面跳转失败(switchTab):', switchErr);
              wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }
      });
    } else {
      // 外部链接，使用web-view打开
      const webviewUrl = `/pages/webview/index?url=${encodeURIComponent(targetUrl)}`;
      console.log('跳转到webview:', webviewUrl);
      
      wx.navigateTo({
        url: webviewUrl,
        success: () => {
          console.log('成功打开webview');
        },
        fail: (err) => {
          console.error('打开链接失败:', err);
          wx.showToast({
            title: '打开链接失败',
            icon: 'none'
          });
        }
      });
    }
  }
});
