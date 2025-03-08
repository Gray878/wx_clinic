import { config } from '../../config/index';
import { getUserDetail, getLocalUserInfo } from '../user/user';

/** 获取个人中心信息 */
function mockFetchUserCenter() {
  const { delay } = require('../_utils/delay');
  const { genUsercenter } = require('../../model/usercenter');
  return delay(200).then(() => {
    const localUserInfo = getLocalUserInfo();
    const mockData = genUsercenter();
    
    if (localUserInfo) {
      mockData.userInfo = {
        ...mockData.userInfo,
        avatarUrl: localUserInfo.avatarUrl,
        nickName: localUserInfo.nickName,
        gender: localUserInfo.gender,
        bgImage: localUserInfo.bgImage || '',
        phone: localUserInfo.phone || ''
      };
    }
    
    return mockData;
  });
}

/**
 * 获取默认的用户中心数据
 * @param {Object} userInfo 可选的用户信息
 * @returns {Object} 默认数据
 */
function getDefaultUserCenterData(userInfo = null) {
  return {
    userInfo: {
      avatarUrl: userInfo?.avatarUrl || '',
      nickName: userInfo?.nickName || '未登录',
      phoneNumber: userInfo?.phone || '',
      gender: userInfo?.gender || 0,
      bgImage: userInfo?.bgImage || '',
      phone: userInfo?.phone || ''
    },
    countsData: [
      { num: userInfo?.points || 0, name: '积分', type: 'point' },
      { num: userInfo?.coupons || 0, name: '优惠券', type: 'coupon' },
    ],
    orderTagInfos: [
      { orderNum: 0, tabType: 5 },
      { orderNum: 0, tabType: 10 },
      { orderNum: 0, tabType: 40 },
      { orderNum: 0, tabType: 0 },
    ],
    customerServiceInfo: {
      servicePhone: '4006336868',
      serviceTimeDuration: '每周三至周五 9:00-12:00  13:00-15:00',
    }
  };
}

/** 获取个人中心信息 */
export async function fetchUserCenter() {
  if (config.useMock) {
    return mockFetchUserCenter();
  }
  
  const localUserInfo = getLocalUserInfo();
  if (!localUserInfo) {
    return getDefaultUserCenterData();
  }
  
  try {
    let userDetail = null;
    
    if (localUserInfo._id) {
      userDetail = await getUserDetail(localUserInfo._id);
    }
    
    // 如果获取不到用户详情，则使用本地存储的信息
    if (!userDetail) {
      return getDefaultUserCenterData(localUserInfo);
    }
    
    return {
      userInfo: {
        avatarUrl: userDetail.avatar_url,
        nickName: userDetail.nickname,
        phoneNumber: userDetail.phone || '',
        gender: userDetail.gender || 0,
        bgImage: userDetail.bg_image || '',
        phone: userDetail.phone || ''
      },
      countsData: [
        { num: userDetail.points || 0, name: '积分', type: 'point' },
        { num: userDetail.coupons || 0, name: '优惠券', type: 'coupon' },
      ],
      orderTagInfos: [
        { orderNum: 0, tabType: 5 },
        { orderNum: 0, tabType: 10 },
        { orderNum: 0, tabType: 40 },
        { orderNum: 0, tabType: 0 },
      ],
      customerServiceInfo: {
        servicePhone: '4006336868',
        serviceTimeDuration: '每周三至周五 9:00-12:00  13:00-15:00',
      }
    };
  } catch (error) {
    console.error('获取用户中心信息失败:', error);
    return getDefaultUserCenterData(localUserInfo);
  }
}
