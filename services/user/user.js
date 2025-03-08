import { DATA_MODEL_KEY } from '../../config/model';
import { model } from '../_utils/model';

// 正确设置USER_MODEL_KEY，确保有默认值
const USER_MODEL_KEY = DATA_MODEL_KEY.USER;

/**
 * 获取本地存储的用户信息
 * @returns {Object|null} 用户信息
 */
export function getLocalUserInfo() {
  const userInfo = wx.getStorageSync('userInfo');
  return userInfo || null;
}

/**
 * 通过openid查询用户信息
 * @param {string} openid 用户openid
 * @returns {Promise<Object|null>} 用户信息
 */
export async function getUserByOpenid(openid) {
  try {
    const dataModel = model();
    if (!dataModel || !dataModel[USER_MODEL_KEY]) {
      console.error('用户数据模型不存在:', USER_MODEL_KEY);
      return null;
    }

    const result = await dataModel[USER_MODEL_KEY].list({
      filter: {
        where: {
          openid: {
            $eq: openid
          }
        }
      }
    });

    return result.data?.records?.[0] || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 创建新用户
 * @param {Object} userInfo 用户信息
 * @returns {Promise<Object|null>} 创建后的用户信息
 */
export async function createUser(userInfo) {
  try {
    const dataModel = model();
    if (!dataModel || !dataModel[USER_MODEL_KEY]) {
      console.error('用户数据模型不存在:', USER_MODEL_KEY);
      return null;
    }

    // 构建用户数据
    const userData = {
      openid: userInfo.openid,
      nickname: userInfo.nickName || '',
      avatar_url: userInfo.avatarUrl || '',
      gender: userInfo.gender || 0,
      status: 1,
      points: 0,
      balance: 0,
      bg_image: '', // 背景图片，默认为空
      phone: '', // 手机号，默认为空
      createdAt: Date.now(), // 创建时间
      updatedAt: Date.now() // 更新时间
    };

    const result = await dataModel[USER_MODEL_KEY].create({
      data: userData
    });

    if (result && result.data) {
      // 构建用户信息对象，确保包含_id字段
      const userObj = {
        _id: result.data.Id || result.data.id || result.data._id || '',
        openid: userData.openid,
        nickname: userData.nickname,
        avatar_url: userData.avatar_url,
        gender: userData.gender,
        status: userData.status,
        points: userData.points,
        balance: userData.balance,
        bg_image: userData.bg_image,
        phone: userData.phone,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
      
      return userObj;
    }

    console.error('创建用户返回异常结果:', result);
    return null;
  } catch (error) {
    console.error('创建用户失败:', error);
    return null;
  }
}

/**
 * 更新用户信息
 * @param {string} userId 用户ID
 * @param {Object} userInfo 用户信息
 * @returns {Promise<Object|null>} 更新后的用户信息
 */
export async function updateUser(userId, userInfo) {
  try {
    const dataModel = model();
    if (!dataModel || !dataModel[USER_MODEL_KEY]) {
      console.error('用户数据模型不存在:', USER_MODEL_KEY);
      return null;
    }

    // 构建需要更新的数据
    const updateData = {};
    
    // 处理昵称
    if (userInfo.nickName !== undefined) {
      updateData.nickname = userInfo.nickName;
    }
    
    // 处理头像
    if (userInfo.avatarUrl !== undefined) {
      updateData.avatar_url = userInfo.avatarUrl;
    }
    
    // 处理性别
    if (userInfo.gender !== undefined) {
      updateData.gender = userInfo.gender;
    }
    
    // 处理手机号
    if (userInfo.phone !== undefined) {
      updateData.phone = userInfo.phone;
    }
    
    // 处理背景图片
    if (userInfo.bgImage !== undefined) {
      updateData.bg_image = userInfo.bgImage;
    }
    
    // 更新时间
    updateData.updatedAt = Date.now();

    // 更新数据库
    const result = await dataModel[USER_MODEL_KEY].update({
      data: updateData,
      filter: {
        where: {
          _id: {
            $eq: userId
          }
        }
      }
    });

    return result.data || null;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return null;
  }
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function checkLogin() {
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  
  return !!(token && userInfo);
}

/**
 * 获取用户登录相关的openid
 * @param {string} code 登录code
 * @returns {Promise<string>} openid
 */
export async function getOpenidByCode(code) {
  try {
    // 调用云函数login获取openid
    const { result } = await wx.cloud.callFunction({
      name: 'login',
      data: { code }
    });

    if (!result || !result.openid) {
      throw new Error('获取openid失败：云函数返回结果异常');
    }

    return result.openid;
  } catch (error) {
    console.error('获取openid失败:', error);
    throw error;
  }
}

/**
 * 获取用户详情
 * @param {string} userId 用户ID
 * @returns {Promise<Object|null>} 用户详情
 */
export async function getUserDetail(userId) {
  try {
    const dataModel = model();
    if (!dataModel || !dataModel[USER_MODEL_KEY]) {
      console.error('用户数据模型不存在:', USER_MODEL_KEY);
      return null;
    }

    const result = await dataModel[USER_MODEL_KEY].get({
      filter: {
        where: {
          _id: {
            $eq: userId
          }
        }
      }
    });

    if (result.code === 0 && result.data) {
      const userData = result.data.records?.[0];
      if (userData) {
        return {
          _id: userData._id,
          nickname: userData.nickname,
          avatar_url: userData.avatar_url,
          gender: userData.gender || 0,
          points: userData.points || 0,
          balance: userData.balance || 0,
          bg_image: userData.bg_image || '',
          phone: userData.phone || '',
          coupons: 0
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return null;
  }
} 