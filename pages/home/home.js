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
    hospitalList: []
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
  }
});
