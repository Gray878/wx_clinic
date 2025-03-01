import { fetchUserCenter } from '../../services/usercenter/fetchUsercenter';
import { getToPayOrderCount, getToSendOrderCount, getToReceiveOrderCount } from '../../services/order/order';
import { ORDER_STATUS } from '../../services/order/order';
import Toast from 'tdesign-miniprogram/toast/index';

const menuData = [
  [
    {
      title: '收货地址',
      tit: '',
      url: '',
      type: 'address',
    },
  ],
];

const orderTagInfos = [
  {
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: ORDER_STATUS.TO_PAY,
    status: 1,
  },
  {
    title: '待发货',
    iconName: 'deliver',
    orderNum: 0,
    tabType: ORDER_STATUS.TO_SEND,
    status: 1,
  },
  {
    title: '待收货',
    iconName: 'package',
    orderNum: 0,
    tabType: ORDER_STATUS.TO_RECEIVE,
    status: 1,
  },
  {
    title: '待评价',
    iconName: 'comment',
    orderNum: 0,
    tabType: ORDER_STATUS.FINISHED,
    status: 1,
  },
  // {
  //   title: '退款/售后',
  //   iconName: 'exchang',
  //   orderNum: 0,
  //   tabType: 0,
  //   status: 1,
  // },
];

const getDefaultData = () => ({
  userInfo: {
    avatarUrl: '',
    nickName: '',
    phoneNumber: ''
  },
  accountInfo: {
    balance: '0',
    points: '0',
    couponCount: '0'
  },
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  versionNo: '',
  toPayOrderCount: 0,
  toSendOrderCount: 0,
  toReceiveOrderCount: 0,
  userCenterBg: 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/user-center-bg.png',
});

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      phoneNumber: ''
    },
    accountInfo: {
      balance: '0',
      points: '0',
      couponCount: '0'
    },
    orderTagInfos: [
      {
        title: '待付款',
        iconName: 'wallet',
        orderNum: 0,
        status: 1,
      },
      {
        title: '待发货',
        iconName: 'deliver',
        orderNum: 0,
        status: 2,
      },
      {
        title: '待收货',
        iconName: 'package',
        orderNum: 0,
        status: 3,
      },
      {
        title: '待评价',
        iconName: 'comment',
        orderNum: 0,
        status: 4,
      }
    ],
    userCenterBg: 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/user-center-bg.png',
  },

  onLoad() {
    this.init();
  },

  onShow() {
    this.getTabBar().init();
    // 每次显示页面时重新获取订单数量
    this.initOrderCount();
  },

  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
  },

  init() {
    this.getUserInfo();
    this.getAccountInfo();
    this.initOrderCount();
  },

  getUserInfo() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    // 这里应改为从后台API获取用户信息，包括背景图
    this.setData({
      userInfo: {
        avatarUrl: userInfo.avatarUrl || '',
        nickName: userInfo.nickName || '未登录',
        phoneNumber: userInfo.phoneNumber || '13800138000' // 测试数据
      },
      // 背景图也应该从后台获取，这里暂时使用默认图片
      userCenterBg: userInfo.backgroundImage || 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/user-center-bg.png'
    });

    // TODO: 从后台获取用户信息的示例代码
    /*
    wx.request({
      url: 'https://your-api-url/user/info',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}` 
      },
      success: (res) => {
        if (res.data.code === 0) {
          const userData = res.data.data;
          this.setData({
            userInfo: {
              avatarUrl: userData.avatarUrl || '',
              nickName: userData.nickName || '未登录',
              phoneNumber: userData.phoneNumber || ''
            },
            userCenterBg: userData.backgroundImage || 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/user-center-bg.png'
          });
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
      }
    });
    */
  },

  getAccountInfo() {
    // 检查用户是否已登录
    const token = wx.getStorageSync('token');
    
    // 如果未登录，使用默认值
    if (!token) {
      this.setData({
        accountInfo: {
          balance: '0',
          points: '0',
          couponCount: '0'
        }
      });
      return;
    }
    
    // 如果已登录，获取账户信息
    // TODO: 这里应该调用后端API获取实际数据
    this.setData({
      accountInfo: {
        balance: '888.88',  // 测试数据
        points: '1000',     // 测试数据
        couponCount: '5'    // 测试数据
      }
    });
    
    // 真实API调用示例
    /*
    wx.request({
      url: 'https://your-api-url/user/account',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          const accountData = res.data.data;
          this.setData({
            accountInfo: {
              balance: accountData.balance || '0',
              points: accountData.points || '0',
              couponCount: accountData.couponCount || '0'
            }
          });
        }
      },
      fail: (err) => {
        console.error('获取账户信息失败', err);
      }
    });
    */
  },

  async initOrderCount() {
    // TODO: 这里应该调用后端API获取实际数据
    this.setData({
      'orderTagInfos[0].orderNum': 1,  // 测试数据
      'orderTagInfos[1].orderNum': 2,  // 测试数据
      'orderTagInfos[2].orderNum': 3,  // 测试数据
      'orderTagInfos[3].orderNum': 4   // 测试数据
    });
  },

  onClickAllOrder() {
    wx.navigateTo({
      url: '/pages/order/order-list/index'
    });
  },

  onClickOrderType(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/order/order-list/index?type=${type}`
    });
  },

  goCouponList() {
    wx.navigateTo({
      url: '/pages/coupon/coupon-list/index'
    });
  },

  gotoUserEditPage() {
    wx.navigateTo({
      url: '/pages/usercenter/person-info/index'
    });
  },

  onClickCell(e) {
    const type = e.currentTarget.dataset.type;
    switch (type) {
      case 'address':
        wx.navigateTo({ url: '/pages/usercenter/address/list/index' });
        break;
      case 'contact':
        // 直接打开客服会话
        wx.openCustomerServiceChat({
          extInfo: { url: '' },
          corpId: '', // 企业ID，需要替换为实际的企业ID
          success(res) {
            console.log('打开客服会话成功', res);
          },
          fail(err) {
            console.error('打开客服会话失败', err);
            // 如果打开客服会话失败，提供备用方案
            wx.makePhoneCall({
              phoneNumber: '400-xxx-xxxx' // 替换为实际的客服电话
            });
          }
        });
        break;
      case 'help-center': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了帮助中心',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'point': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了积分菜单',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'coupon': {
        wx.navigateTo({ url: '/pages/coupon/coupon-list/index' });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;

    if (status === 0) {
      wx.navigateTo({ url: '/pages/order/after-service-list/index' });
    } else {
      wx.navigateTo({ url: `/pages/order/order-list/index?status=${status}` });
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const { version, envVersion = __wxConfig } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
});
