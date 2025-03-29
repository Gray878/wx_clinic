import { fetchUserCenter } from '../../services/usercenter/fetchUsercenter';
import { getToPayOrderCount, getToSendOrderCount, getToReceiveOrderCount } from '../../services/order/order';
import { ORDER_STATUS } from '../../services/order/order';
import Toast from 'tdesign-miniprogram/toast/index';
import { createUser, getUserByOpenid, updateUser, getOpenidByCode } from '../../services/user/user';
import { cloudbaseTemplateConfig } from '../../config/index';
import { fetchUserCoupons } from '../../services/coupon/coupon';

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

const _getDefaultData = () => ({
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
    currAuthStep: 1,
    userInfo: {
      avatarUrl: '',
      nickName: '未登录',
      phoneNumber: '',
      gender: 0,
    },
    customerServiceInfo: {},
    orderTagInfos: [],
    vipInfo: {
      icon: '',
      title: '',
      desc: '',
    },
    countsData: [],
    isLogin: false,
    showLoginDialog: false,
    showUserInfoDialog: false,
    tempUserInfo: {
      avatarUrl: '',
      nickName: '微信用户'
    },
    openid: '',
    couponCount: 0,
  },

  onLoad() {
    const app = getApp();
    // 从本地存储获取登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    // 更新页面登录状态
    this.setData({
      isLogin: !!token && !!userInfo,
      userInfo: userInfo || {
        avatarUrl: '',
        nickName: '未登录',
        phoneNumber: '',
        gender: 0,
      }
    });

    // 同步更新全局登录状态
    app.globalData.isLoggedIn = this.data.isLogin;

    const tabBar = this.getTabBar();
    if (tabBar) {
      tabBar.init();
    }
  },

  onShow() {
    const app = getApp();
    // 从本地存储获取最新状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = !!token && !!userInfo;
    
    // 同步更新全局状态和页面状态
    app.globalData.isLoggedIn = isLoggedIn;
    this.setData({ 
        isLogin: isLoggedIn,
        userInfo: userInfo || {
            avatarUrl: '',
            nickName: '未登录',
            phoneNumber: '',
            gender: 0,
        }
    });
    
    // 如果已登录，刷新数据
    if (isLoggedIn) {
        this.fetchData();
        this.getCouponCount();
    }

    this.init();
  },

  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
  },

  init() {
    this.fetchData();
  },

  fetchData() {
    fetchUserCenter().then(
      ({
        userInfo,
        countsData,
        orderTagInfos,
        customerServiceInfo = {},
      }) => {
        const isLogin = !!wx.getStorageSync('userInfo');

        // 如果未登录，使用默认值
        if (!isLogin) {
          userInfo = {
            avatarUrl: 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user.png',
            nickName: '未登录',
            phoneNumber: '',
            gender: 0,
          };
        } else if (!userInfo.avatarUrl) {
          // 如果已登录但没有头像，使用默认头像
          userInfo.avatarUrl = 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user.png';
        }

        this.setData({
          userInfo,
          countsData,
          orderTagInfos,
          customerServiceInfo,
          isLogin,
        });
      }
    );
  },

  onClickCell(e) {
    const { type } = e.currentTarget.dataset;
    
    // 检查登录状态
    if (!this.data.isLogin && type !== 'service') {
      // 显示登录提示
      this.setData({
        showLoginDialog: true
      });
      return;
    }

    switch (type) {
      case 'address': {
        wx.navigateTo({
          url: '/pages/usercenter/address/list/index',
        });
        break;
      }
      case 'service': {
        wx.makePhoneCall({
          phoneNumber: this.data.customerServiceInfo.servicePhone,
        });
        break;
      }
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
      case 'points': {
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
        wx.navigateTo({
          url: '/packageCoupon/pages/coupon/index',
        });
        break;
      }
      case 'contact': {
        // 联系我们功能
        this.showServicePopup();
        break;
      }
      case 'logout': {
        // 退出登录功能
        this.showLogoutConfirm();
        break;
      }
      case 'name-edit': {
        wx.navigateTo({
          url: '/packageUser/pages/name-edit/index',
        });
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
    const { status } = e.currentTarget.dataset;

    // 检查登录状态
    if (!this.data.isLogin) {
      // 显示登录提示
      this.setData({
        showLoginDialog: true
      });
      return;
    }

    if (status === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '敬请期待',
        icon: '',
        duration: 1000,
      });
      return;
    }
    
    if (status === 1) {
      wx.navigateTo({
        url: '/pages/order/order-list/index?status=5',
      });
    } else if (status === 2) {
      wx.navigateTo({
        url: '/pages/order/order-list/index?status=10',
      });
    } else if (status === 3) {
      wx.navigateTo({
        url: '/pages/order/order-list/index?status=40',
      });
    } else if (status === 4) {
      wx.navigateTo({
        url: '/pages/order/after-service-list/index',
      });
    }
  },

  // 处理订单类型点击
  onClickOrderType(e) {
    const { type } = e.currentTarget.dataset;
    
    // 检查登录状态
    if (!this.data.isLogin) {
      // 显示登录提示
      this.setData({
        showLoginDialog: true
      });
      return;
    }
    
    // 根据订单类型跳转到对应的订单列表页
    let status = '0';
    switch (type) {
      case '1': // 待付款
        status = '5';
        break;
      case '2': // 待发货
        status = '10';
        break;
      case '3': // 待收货
        status = '40';
        break;
      case '4': // 待评价
        status = '50';
        break;
      default:
        status = '0';
    }
    
    wx.navigateTo({
      url: `/pages/order/order-list/index?status=${status}`,
    });
  },
  
  // 处理全部订单点击
  onClickAllOrder() {
    // 检查登录状态
    if (!this.data.isLogin) {
      // 显示登录提示
      this.setData({
        showLoginDialog: true
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/order/order-list/index?status=0',
    });
  },

  gotoUserEditPage() {
    // 从本地存储获取最新状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = !!token && !!userInfo;
    
    // 更新页面状态和全局状态
    const app = getApp();
    app.globalData.isLoggedIn = isLoggedIn;
    this.setData({ isLogin: isLoggedIn });
    
    if (!isLoggedIn) {
        this.setData({
            showLoginDialog: true
        });
        return;
    }

    // 已登录则跳转到个人信息页
    wx.navigateTo({
        url: '/packageUser/pages/person-info/index',
        fail: (err) => {
            console.error('页面跳转失败:', err);
            wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
  },

  // 用户登录 - 直接在按钮点击事件中处理
  handleLogin() {
    // 直接显示用户信息填写弹窗
    this.setData({
      showLoginDialog: false,
      showUserInfoDialog: true,
      tempUserInfo: {
        avatarUrl: '',
        nickName: '微信用户'
      }
    });
  },

  // 完成登录流程
  async completeLogin(dbUser, openid) {
    try {
      // 设置用户信息
      const userInfo = {
        _id: dbUser._id || dbUser.Id || dbUser.id || '',
        nickName: dbUser.nickName || dbUser.nickname || '微信用户',
        avatarUrl: dbUser.avatarUrl || dbUser.avatar_url || '',
        gender: dbUser.gender || 0,
        openid: openid,
        bgImage: dbUser.bgImage || dbUser.bg_image || '',
        phone: dbUser.phone || ''
      };
      
      // 设置token
      const mockToken = 'mock_token_' + Date.now();
      wx.setStorageSync('token', mockToken);
      wx.setStorageSync('userInfo', userInfo);
      
      // 同时更新全局状态和页面状态
      const app = getApp();
      app.globalData.isLoggedIn = true;
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        showLoginDialog: false,
        showUserInfoDialog: false
      });
      
      // 刷新页面数据
      await this.fetchData();
      
      // 获取优惠券数量
      await this.getCouponCount();
      
      // // 获取订单数量
      // await Promise.all([
      //   this.getToPayOrderCount(),
      //   this.getToSendOrderCount(),
      //   this.getToReceiveOrderCount()
      // ]);
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('登录完成后刷新数据失败:', error);
      wx.showToast({
        title: '数据刷新失败',
        icon: 'none'
      });
    }
  },

  // 获取待付款订单数量
  async getToPayOrderCount() {
    try {
      const count = await getToPayOrderCount();
      this.setData({
        'orderTagInfos[0].orderNum': count
      });
    } catch (error) {
      console.error('获取待付款订单数量失败:', error);
    }
  },

  // 获取待发货订单数量
  async getToSendOrderCount() {
    try {
      const count = await getToSendOrderCount();
      this.setData({
        'orderTagInfos[1].orderNum': count
      });
    } catch (error) {
      console.error('获取待发货订单数量失败:', error);
    }
  },

  // 获取待收货订单数量
  async getToReceiveOrderCount() {
    try {
      const count = await getToReceiveOrderCount();
      this.setData({
        'orderTagInfos[2].orderNum': count
      });
    } catch (error) {
      console.error('获取待收货订单数量失败:', error);
    }
  },

  // 处理用户选择头像
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    
    // 先显示临时头像
    this.setData({
      'tempUserInfo.avatarUrl': avatarUrl
    });
    
    try {
      // 上传头像到云存储
      wx.showLoading({
        title: '上传头像中...',
        mask: true
      });
      
      // 生成云存储路径
      const timestamp = Date.now();
      const cloudPath = `avatars/${timestamp}${avatarUrl.match(/\.[^.]+?$/) ? avatarUrl.match(/\.[^.]+?$/)[0] : '.jpg'}`;
      
      // 上传文件
      const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath: avatarUrl
      });
      
      wx.hideLoading();
      
      if (res.fileID) {
        // 更新头像为云存储路径
        this.setData({
          'tempUserInfo.avatarUrl': res.fileID
        });
        console.log('头像上传成功:', res.fileID);
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('上传头像失败:', error);
      wx.showToast({
        title: '头像上传失败，请重试',
        icon: 'none'
      });
    }
  },

  // 处理用户输入昵称
  onInputNickname(e) {
    this.setData({
      'tempUserInfo.nickName': e.detail.value
    });
  },

  // 提交用户信息
  async submitUserInfo() {
    wx.showLoading({
      title: '登录中...',
      mask: true
    });
    
    try {
      const { tempUserInfo } = this.data;
      
      // 验证信息
      if (!tempUserInfo.avatarUrl) {
        throw new Error('请选择头像');
      }
      if (!tempUserInfo.nickName.trim()) {
        throw new Error('请输入昵称');
      }

      // 如果头像URL不是云存储路径（不是以cloud://开头），则再次上传
      if (tempUserInfo.avatarUrl && !tempUserInfo.avatarUrl.startsWith('cloud://')) {
        try {
          // 生成云存储路径
          const timestamp = Date.now();
          const cloudPath = `avatars/${timestamp}${tempUserInfo.avatarUrl.match(/\.[^.]+?$/) ? tempUserInfo.avatarUrl.match(/\.[^.]+?$/)[0] : '.jpg'}`;
          
          // 上传文件
          const res = await wx.cloud.uploadFile({
            cloudPath,
            filePath: tempUserInfo.avatarUrl
          });
          
          if (res.fileID) {
            tempUserInfo.avatarUrl = res.fileID;
          }
        } catch (error) {
          console.error('上传头像失败:', error);
          // 即使上传失败也继续登录流程，使用临时路径
        }
      }

      // 执行登录
      wx.login({
        success: async (res) => {
          if (!res.code) {
            throw new Error('登录失败，未获取到code');
          }
          
          // 获取openid
          const openid = await getOpenidByCode(res.code);
          
          // 创建或更新用户信息
          let dbUser = null;
          
          try {
            // 先尝试获取用户
            dbUser = await getUserByOpenid(openid);
            
            if (dbUser) {
              // 更新用户信息
              await updateUser(dbUser._id, {
                nickName: tempUserInfo.nickName,
                avatarUrl: tempUserInfo.avatarUrl
              });
              dbUser.nickName = tempUserInfo.nickName;
              dbUser.avatarUrl = tempUserInfo.avatarUrl;
            } else {
              // 创建新用户
              dbUser = await createUser({
                nickName: tempUserInfo.nickName,
                avatarUrl: tempUserInfo.avatarUrl,
                openid: openid
              });
            }
            
            // 完成登录
            this.completeLogin(dbUser, openid);
            
          } catch (error) {
            console.error('保存用户信息失败:', error);
            throw error;
          }
        },
        fail: (err) => {
          console.error('微信登录失败:', err);
          throw new Error('微信登录失败');
        }
      });
      
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  // 关闭用户信息弹窗
  closeUserInfoDialog() {
    this.setData({
      showUserInfoDialog: false
    });
  },

  /**
   * 获取优惠券数量
   */
  getCouponCount() {
    fetchUserCoupons(1).then(coupons => {
      this.setData({
        couponCount: coupons.length
      });
    }).catch(error => {
      console.error('获取优惠券数量失败:', error);
      this.setData({
        couponCount: 0
      });
    });
  },

  // 显示联系我们弹窗
  showServicePopup() {
    const { customerServiceInfo } = this.data;
    if (!customerServiceInfo || !customerServiceInfo.servicePhone) {
      wx.showToast({
        title: '客服信息未配置',
        icon: 'none'
      });
      return;
    }
    
    wx.showActionSheet({
      itemList: ['拨打客服电话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({
            phoneNumber: customerServiceInfo.servicePhone,
            fail: (err) => {
              console.error('拨打电话失败', err);
              wx.showToast({
                title: '拨打电话失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 显示退出登录确认框
  showLogoutConfirm() {
    wx.showModal({
      title: '确认退出登录',
      content: '退出后将清除登录信息，是否继续？',
      confirmColor: '#FA4126',
      success: (res) => {
        if (res.confirm) {
          this.logout();
        }
      }
    });
  },

  // 执行退出登录操作
  logout() {
    // 清除本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    
    // 同时更新全局状态和页面状态
    const app = getApp();
    app.globalData.isLoggedIn = false;
    this.setData({
        isLogin: false,
        userInfo: {
            avatarUrl: '',
            nickName: '未登录',
            phoneNumber: '',
            gender: 0,
        },
        couponCount: 0
    });
    
    // 刷新页面
    this.fetchData();
    
    wx.showToast({
        title: '已退出登录',
        icon: 'success'
    });
  },

  // 添加关闭登录弹窗的方法
  closeLoginDialog() {
    this.setData({
      showLoginDialog: false
    });
  },

  // 点击遮罩层关闭弹窗
  closeDialogByMask() {
    this.setData({
      showLoginDialog: false,
      showUserInfoDialog: false
    });
  }
});
