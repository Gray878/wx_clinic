import { DATA_MODEL_KEY } from '../../config/model';
import { getAll, model } from '../_utils/model';
import { cloudbaseTemplateConfig } from '../../config/index';
import { createId } from '../cloudbaseMock/index';

const HOSPITAL_MODEL_KEY = DATA_MODEL_KEY.HOSPITAL;

// 模拟医院数据，用于本地测试
const MOCK_HOSPITAL_DATA = [
  {
    _id: 'hospital_001',
    name: '北京大学肿瘤医院',
    cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/beijingdaxuezhongliu.jpg',
    rating: 5,
    city_code: 'bj',
    city_name: '北京',
    address: '北京市海淀区阜成路52号',
    business_hour: '周一至周五 8:00-17:00',
    phone: '010-88196688',
    introduction: '北京大学肿瘤医院创建于1976年，是集医疗、教学、科研、预防为一体的三级甲等专科医院。',
    location: { longitude: 116.2345, latitude: 39.5678 }
  },
  {
    _id: 'hospital_002',
    name: '北京中医药大学第三附属医院',
    cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/beijingzhongyiyao.jpg',
    rating: 5,
    city_code: 'bj',
    city_name: '北京',
    address: '北京市朝阳区和平里北街11号',
    business_hour: '周一至周日 8:00-17:30',
    phone: '010-58115999',
    introduction: '北京中医药大学第三附属医院始建于1958年，是一所集医疗、教学、科研为一体的三级甲等中医医院。',
    location: { longitude: 116.3456, latitude: 39.6789 }
  },
  {
    _id: 'hospital_003',
    name: '北京大学口腔医学院',
    cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/beijingdaxuekouqiang.jpg',
    rating: 5,
    city_code: 'bj',
    city_name: '北京',
    address: '北京市海淀区中关村南大街22号',
    business_hour: '周一至周五 8:00-17:00，周六周日 8:00-12:00',
    phone: '010-82195555',
    introduction: '北京大学口腔医学院是中国历史最悠久的口腔医学院之一，是国家重点学科，国家临床重点专科。',
    location: { longitude: 116.4567, latitude: 39.7890 }
  },
  {
    _id: 'hospital_004',
    name: '中国中医科学院西苑医院',
    cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/zhongguozhongyixiyuan.jpg',
    rating: 5,
    city_code: 'bj',
    city_name: '北京',
    address: '北京市海淀区西苑操场1号',
    business_hour: '周一至周日 8:00-17:00',
    phone: '010-62835678',
    introduction: '中国中医科学院西苑医院创建于1955年，是一所以中医药为特色的三级甲等医院。',
    location: { longitude: 116.5678, latitude: 39.8901 }
  },
  {
    _id: 'hospital_005',
    name: '北京协和医院',
    cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/beijingxiehe.jpg',
    rating: 5,
    city_code: 'bj',
    city_name: '北京',
    address: '北京市东城区帅府园1号',
    business_hour: '周一至周五 8:00-17:00',
    phone: '010-69156114',
    introduction: '北京协和医院创建于1921年，是中国最著名的医院之一，集医疗、教学、科研为一体的大型综合医院。',
    location: { longitude: 116.6789, latitude: 39.9012 }
  },
  {
    _id: 'hospital_006',
    name: '广州中医药大学第一附属医院',
    cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/guangzhouzhongyiyao.jpg',
    rating: 5,
    city_code: 'gz',
    city_name: '广州',
    address: '广州市白云区机场路16号',
    business_hour: '周一至周日 8:00-17:30',
    phone: '020-36591912',
    introduction: '广州中医药大学第一附属医院创建于1964年，是国家中医药管理局重点建设的中医医院。',
    location: { longitude: 113.2345, latitude: 23.5678 }
  },
  {
    _id: 'hospital_007',
    name: '中山大学附属第一医院',
    cover_image: 'https://example-dev-2gziune0bea67a75.service.tcloudbase.com/hospital/zhongshanyiyuan.jpg',
    rating: 5,
    city_code: 'gz',
    city_name: '广州',
    address: '广州市中山二路58号',
    business_hour: '周一至周日 8:00-17:30',
    phone: '020-87755766',
    introduction: '中山大学附属第一医院创建于1910年，是中国历史最悠久的西医医院之一，集医疗、教学、科研为一体。',
    location: { longitude: 113.3456, latitude: 23.6789 }
  }
];

/**
 * 获取所有医院数据
 * @returns {Promise<Array>} 医院数据列表
 */
export async function getAllHospitals() {
  if (cloudbaseTemplateConfig.useMock) {
    return MOCK_HOSPITAL_DATA;
  }
  
  try {
    const result = await model()[HOSPITAL_MODEL_KEY].list({
      select: {
        _id: true,
        name: true,
        address: true,
        business_hour: true,
        phone: true,
        rating: true,
        cover_image: true,
        introduction: true,
        city: {
          _id: true,
          code: true,
          name: true
        }
      },
      orderBy: [
        { rating: 'desc' }
      ]
    });
    
    // 处理返回结果
    const hospitals = result.data?.records || [];
    
    // 处理医院数据，确保cover_image有默认值
    return hospitals.map(hospital => ({
      ...hospital,
      cover_image: hospital.cover_image || 'https://cdn-we-retail.ym.tencent.com/miniapp/hospital/default_hospital.jpg',
      city_code: hospital.city?.code || ''
    }));
  } catch (error) {
    console.error('获取医院数据失败:', error);
    return [];
  }
}

/**
 * 根据城市获取医院列表
 * @param {string} cityCode 城市代码，如果为空则获取所有医院
 * @returns {Promise<Array>} 过滤后的医院列表
 */
export async function getHospitalsByCity(cityCode) {
  if (cloudbaseTemplateConfig.useMock) {
    return cityCode 
      ? MOCK_HOSPITAL_DATA.filter(hospital => hospital.city_code === cityCode) 
      : MOCK_HOSPITAL_DATA;
  }
  
  try {
    const filter = {};
    
    // 如果指定了城市，添加过滤条件
    if (cityCode) {
      filter.relateWhere = {
        city: {
          where: {
            code: { $eq: cityCode }
          }
        }
      };
    }
    
    const result = await model()[HOSPITAL_MODEL_KEY].list({
      filter,
      select: {
        _id: true,
        name: true,
        address: true,
        business_hour: true,
        phone: true,
        rating: true,
        cover_image: true,
        introduction: true,
        city: {
          _id: true,
          code: true,
          name: true
        }
      },
      orderBy: [
        { rating: 'desc' }
      ]
    });
    
    // 处理返回结果
    const hospitals = result.data?.records || [];
    
    // 处理医院数据，确保cover_image有默认值
    return hospitals.map(hospital => ({
      ...hospital,
      cover_image: hospital.cover_image || 'https://cdn-we-retail.ym.tencent.com/miniapp/hospital/default_hospital.jpg',
      city_code: hospital.city?.code || ''
    }));
  } catch (error) {
    console.error('获取医院数据失败:', error);
    return [];
  }
}

/**
 * 获取医院详情
 * @param {string} id 医院ID
 * @returns {Promise<Object|null>} 医院详情
 */
export async function getHospitalById(id) {
  if (cloudbaseTemplateConfig.useMock) {
    return MOCK_HOSPITAL_DATA.find(hospital => hospital._id === id) || null;
  }
  
  try {
    const result = await model()[HOSPITAL_MODEL_KEY].get({
      filter: {
        where: {
          _id: { $eq: id }
        }
      },
      select: {
        _id: true,
        name: true,
        address: true,
        business_hour: true,
        phone: true,
        rating: true,
        cover_image: true,
        introduction: true,
        city: {
          _id: true,
          name: true,
          code: true
        }
      }
    });
    
    const hospital = result.data;
    if (!hospital) return null;
    
    // 确保cover_image有默认值
    return {
      ...hospital,
      cover_image: hospital.cover_image || 'https://cdn-we-retail.ym.tencent.com/miniapp/hospital/default_hospital.jpg',
      city_code: hospital.city?.code || '',
      city_name: hospital.city?.name || ''
    };
  } catch (error) {
    console.error(`获取医院(${id})信息失败:`, error);
    return null;
  }
}

/**
 * 获取精选医院列表（评分较高的）
 * @param {string} cityCode 城市代码，如果为空则获取所有城市的精选医院
 * @param {number} limit 返回数量限制
 * @returns {Promise<Array>} 精选医院列表
 */
export async function getFeaturedHospitals(cityCode, limit = 3) {
  if (cloudbaseTemplateConfig.useMock) {
    let hospitals = MOCK_HOSPITAL_DATA;
    
    // 如果指定了城市，进行过滤
    if (cityCode) {
      hospitals = hospitals.filter(hospital => hospital.city_code === cityCode);
    }
    
    // 按评分排序并限制数量
    return hospitals
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
  
  try {
    const filter = {};
    
    // 如果指定了城市，添加过滤条件
    if (cityCode) {
      filter.relateWhere = {
        city: {
          where: {
            code: { $eq: cityCode }
          }
        }
      };
    }
    
    const result = await model()[HOSPITAL_MODEL_KEY].list({
      filter,
      select: {
        _id: true,
        name: true,
        address: true,
        business_hour: true,
        phone: true,
        rating: true,
        cover_image: true,
        city: {
          _id: true,
          code: true,
          name: true
        }
      },
      orderBy: [
        { rating: 'desc' }
      ],
      pageSize: limit,
      pageNumber: 1
    });
    
    // 处理返回结果
    const hospitals = result.data?.records || [];
    
    // 处理医院数据，确保cover_image有默认值
    return hospitals.map(hospital => ({
      ...hospital,
      cover_image: hospital.cover_image || 'https://cdn-we-retail.ym.tencent.com/miniapp/hospital/default_hospital.jpg',
      city_code: hospital.city?.code || ''
    }));
  } catch (error) {
    console.error('获取精选医院数据失败:', error);
    return [];
  }
} 