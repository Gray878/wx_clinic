import { DATA_MODEL_KEY } from '../../config/model';
import { getAll, model } from '../_utils/model';
import { cloudbaseTemplateConfig } from '../../config/index';
import { createId } from '../cloudbaseMock/index';

const SERVER_CITY_MODEL_KEY = DATA_MODEL_KEY.CITY;

// 模拟城市数据，用于本地测试
const MOCK_CITY_DATA = [
  {
    _id: 'city-001',
    name: '广州',
    code: 'gz',
    is_active: true,
    sort: 1
  },
  {
    _id: 'city-002',
    name: '佛山',
    code: 'fs',
    is_active: true,
    sort: 2
  },
  {
    _id: 'city-003',
    name: '惠州',
    code: 'hz',
    is_active: true,
    sort: 3
  }
];

/**
 * 获取所有城市数据
 * @returns {Promise<Array>} 城市数据列表
 */
export async function getAllCities() {
  if (cloudbaseTemplateConfig.useMock) {
    return MOCK_CITY_DATA;
  }
  
  try {
    const result = await model()[SERVER_CITY_MODEL_KEY].list({
      select: {
        _id: true,
        name: true,
        code: true,
        is_active: true,
        sort: true
      },
      filter: {
        where: {
          is_active: { $eq: true }
        }
      },
      sort: {
        sort: 1 // 按sort字段升序排序
      }
    });
    
    return result.data?.records || [];
  } catch (error) {
    console.error('获取城市数据失败:', error);
    return [];
  }
}

/**
 * 获取活跃城市列表
 * @returns {Promise<Array>} 活跃的城市数据列表
 */
export async function getActiveCities() {
  if (cloudbaseTemplateConfig.useMock) {
    return MOCK_CITY_DATA.filter(city => city.is_active);
  }
  
  try {
    const result = await model()[SERVER_CITY_MODEL_KEY].list({
      select: {
        _id: true,
        name: true,
        code: true,
        sort: true
      },
      filter: {
        where: {
          is_active: { $eq: true }
        }
      },
      sort: {
        sort: 1 // 按sort字段升序排序
      }
    });
    
    return result.data?.records || [];
  } catch (error) {
    console.error('获取活跃城市数据失败:', error);
    return [];
  }
}

/**
 * 根据城市代码获取城市信息
 * @param {string} code 城市代码
 * @returns {Promise<Object|null>} 城市信息
 */
export async function getCityByCode(code) {
  if (cloudbaseTemplateConfig.useMock) {
    return MOCK_CITY_DATA.find(city => city.code === code) || null;
  }
  
  try {
    const result = await model()[SERVER_CITY_MODEL_KEY].list({
      select: {
        _id: true,
        name: true,
        code: true,
        is_active: true,
        sort: true
      },
      filter: {
        where: {
          code: { $eq: code }
        }
      }
    });
    
    return result.data?.records?.[0] || null;
  } catch (error) {
    console.error(`获取城市(${code})信息失败:`, error);
    return null;
  }
}

/**
 * 获取默认城市
 * @returns {Promise<Object>} 默认城市信息
 */
export async function getDefaultCity() {
  if (cloudbaseTemplateConfig.useMock) {
    return MOCK_CITY_DATA[0];
  }
  
  try {
    const cities = await getActiveCities();
    return cities.length > 0 ? cities[0] : null;
  } catch (error) {
    console.error('获取默认城市失败:', error);
    return null;
  }
} 