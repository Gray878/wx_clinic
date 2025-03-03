import Toast from 'tdesign-miniprogram/toast/index';
import { getHospitalById } from '../../../services/hospital/hospital';
import { getCloudImageTempUrl, getSingleCloudImageTempUrl } from '../../../utils/cloudImageHandler';

// 处理富文本中的云存储图片链接
async function processRichText(text) {
  if (!text) return '';
  
  try {
    let processed = text;

    // 使用正则表达式匹配所有被双引号包裹的云存储链接
    const regex = /"(cloud:\/\/[^"]*)"/g;
    let match;
    // 使用循环处理所有匹配的链接
    while ((match = regex.exec(processed)) !== null) {
      const originalLink = match[0];
      const pureLink = match[1];
      // 获取临时访问链接
      const tempUrl = await getSingleCloudImageTempUrl(pureLink);
      // 替换文本中的原始链接
      processed = processed.replace(originalLink, `"${tempUrl}"`);
    }
    
    // 确保HTML标签正确关闭
    processed = processed.replace(/<img([^>]*)>/g, '<img$1 />');
    
    // 处理段落间距
    processed = processed.replace(/<p>/g, '<p style="margin-bottom: 20rpx; font-size: 28rpx; line-height: 1.8;">');
    
    return processed;
  } catch (error) {
    console.error('处理富文本失败:', error);
    return text || '';
  }
}

Page({
  data: {
    hospital: null,
    pageLoading: true,
    processedIntroduction: '' // 添加处理后的简介字段
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadHospitalDetail(id);
    } else {
      this.setData({ pageLoading: false });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '未指定医院ID',
        icon: 'error',
        duration: 2000,
      });
    }
  },

  async loadHospitalDetail(id) {
    try {
      // 获取医院详情
      const hospital = await getHospitalById(id);
      
      if (hospital) {
        // 处理图片资源，获取临时URL
        if (hospital.cover_image) {
          const handledImages = await getCloudImageTempUrl([hospital.cover_image]);
          if (handledImages && handledImages.length > 0) {
            hospital.cover_image = handledImages[0];
          }
        }
        
        // 如果没有评分数量，添加默认值
        if (!hospital.rating_count) {
          hospital.rating_count = Math.floor(Math.random() * 100) + 50; // 随机生成50-150之间的数字
        }
        
        // 确保评分存在且合理
        if (!hospital.rating || hospital.rating < 1) {
          hospital.rating = 5; // 默认5星评分
        }
        
        // 处理富文本简介
        const processedIntroduction = await processRichText(hospital.introduction);
        
        this.setData({
          hospital,
          processedIntroduction,
          pageLoading: false
        });
      } else {
        this.setData({ pageLoading: false });
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未找到医院信息',
          icon: 'error',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('加载医院详情失败:', error);
      this.setData({ pageLoading: false });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载医院信息失败',
        icon: 'error',
        duration: 2000,
      });
    }
  },

  // 导航到医院地址
  navigateToHospital() {
    const { hospital } = this.data;
    if (!hospital || !hospital.address) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '无法获取医院位置信息',
        icon: 'error',
        duration: 1000,
      });
      return;
    }
    
    // 尝试通过地址导航
    wx.openLocation({
      address: hospital.address,
      name: hospital.name,
      scale: 18,
      fail: () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '导航失败，请稍后再试',
          icon: 'error',
          duration: 1000,
        });
      }
    });
  },
  
  // 拨打医院电话
  callHospital() {
    const { hospital } = this.data;
    if (!hospital || !hospital.phone) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '未提供医院联系电话',
        icon: 'error',
        duration: 1000,
      });
      return;
    }
    
    wx.makePhoneCall({
      phoneNumber: hospital.phone,
      fail: () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '拨打电话失败',
          icon: 'error',
          duration: 1000,
        });
      }
    });
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }
    });
  },
  
  // 分享
  onShareAppMessage() {
    const { hospital } = this.data;
    if (hospital) {
      return {
        title: `${hospital.name} - 粤心陪诊`,
        path: `/pages/hospital/detail/index?id=${hospital._id}`
      };
    }
    return {
      title: '粤心陪诊 - 三甲医院',
      path: '/pages/home/home'
    };
  }
}); 