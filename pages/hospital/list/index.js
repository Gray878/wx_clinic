import Toast from 'tdesign-miniprogram/toast/index';
import { getHospitalsByCity, getAllHospitals } from '../../../services/hospital/hospital';
import { getAllCities } from '../../../services/city/city';
import { getCloudImageTempUrl } from '../../../utils/cloudImageHandler';

Page({
  data: {
    cityList: [],
    currentCity: '全部',
    currentCityCode: '',
    hospitalList: [],
    pageLoading: true
  },

  onLoad(options) {
    // 获取URL参数中的城市信息
    const { city, cityCode } = options;
    if (city && cityCode) {
      this.setData({
        currentCity: city,
        currentCityCode: cityCode
      });
    }
    
    // 加载城市列表
    this.loadCityList();
    // 加载医院列表
    this.loadHospitalList();
  },

  // 加载城市列表
  async loadCityList() {
    try {
      // 获取所有活跃城市
      const cityList = await getAllCities();
      
      if (cityList && cityList.length > 0) {
        // 转换为城市名称数组，添加"全部"选项
        const cityNames = ['全部', ...cityList.map(city => city.name)];
        this.setData({ cityList: cityNames });
      } else {
        // 如果没有获取到城市数据，则使用默认值
        this.setData({
          cityList: ['全部', '北京', '广州', '佛山', '惠州']
        });
      }
    } catch (error) {
      console.error('加载城市数据失败:', error);
      // 设置默认城市数据
      this.setData({
        cityList: ['全部', '北京', '广州', '佛山', '惠州']
      });
    }
  },

  // 加载医院列表
  async loadHospitalList() {
    try {
      // 获取当前选择的城市码
      const cityCode = this.data.currentCityCode;
      
      // 根据城市码获取医院列表
      const hospitals = cityCode ? 
        await getHospitalsByCity(cityCode) : 
        await getAllHospitals();
      
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
        hospitalList: hospitals,
        pageLoading: false
      });
    } catch (error) {
      console.error('加载医院列表失败:', error);
      this.setData({ pageLoading: false });
      
      // 显示错误提示
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载医院列表失败',
        icon: 'error',
        duration: 2000,
      });
    }
  },

  // 选择城市
  selectCity(e) {
    const city = e.currentTarget.dataset.city;
    
    // 查找对应的城市代码
    let cityCode = '';
    if (city !== '全部') {
      // 从页面上下文或其他途径获取城市代码
      // 这里使用简单的映射示例
      const cityCodeMap = {
        '北京': 'bj',
        '广州': 'gz',
        '佛山': 'fs',
        '惠州': 'hz'
      };
      cityCode = cityCodeMap[city] || '';
    }
    
    this.setData({
      currentCity: city,
      currentCityCode: cityCode,
      pageLoading: true
    });
    
    this.loadHospitalList();
  },

  // 医院点击处理
  hospitalClickHandle(e) {
    const hospital = e.currentTarget.dataset.hospital;
    if (!hospital || !hospital._id) return;
    
    wx.navigateTo({
      url: `/pages/hospital/detail/index?id=${hospital._id}`,
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

  onShareAppMessage() {
    return {
      title: '润民陪护  - 三甲医院',
      path: '/pages/hospital/list/index'
    };
  }
}); 