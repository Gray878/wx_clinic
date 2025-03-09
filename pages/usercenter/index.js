import { fetchUserCenter } from '../../services/usercenter/fetchUsercenter';
import { getToPayOrderCount, getToSendOrderCount, getToReceiveOrderCount } from '../../services/order/order';
import { ORDER_STATUS } from '../../services/order/order';
import Toast from 'tdesign-miniprogram/toast/index';
import { createUser, getUserByOpenid, updateUser, getOpenidByCode } from '../../services/user/user';
import { cloudbaseTemplateConfig } from '../../config/index';

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
  },

  onLoad() {
    const tabBar = this.getTabBar();
    if (tabBar) {
      tabBar.init();
    }
  },

  onShow() {
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

  onClickCell({ currentTarget }) {
    const { type } = currentTarget.dataset;

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
          url: '/pages/coupon/index',
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

  gotoUserEditPage() {
    // 检查登录状态
    if (!this.data.isLogin) {
      // 显示登录提示
      this.setData({
        showLoginDialog: true
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/usercenter/person-info/index',
    });
  },

  // 用户登录 - 直接在按钮点击事件中处理
  handleLogin() {
    // 直接调用getUserProfile，必须由用户点击事件触发
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: async (res) => {
        const userInfoFromWx = res.userInfo;
        wx.showLoading({
          title: '登录中...',
          mask: true
        });
        
        try {
          // 1. 登录获取code
          const loginRes = await new Promise((resolve, reject) => {
            wx.login({
              success: (res) => resolve(res),
              fail: (err) => reject(err)
            });
          });
          
          if (!loginRes.code) {
            throw new Error('登录失败，未获取到code');
          }
          
          // 2. 获取openid (实际项目中需调用云函数或后端接口获取)
          const openid = await getOpenidByCode(loginRes.code);
          
          // 3. 查询用户是否已存在
          let dbUser = null;
          
          // 如果使用模拟环境，直接使用本地存储
          if (cloudbaseTemplateConfig.useMock) {
            // 检查本地模拟用户存储
            const mockUsers = wx.getStorageSync('mockUsers') || [];
            dbUser = mockUsers.find(user => user.openid === openid);
          } else {
            // 真实环境调用接口
            try {
              dbUser = await getUserByOpenid(openid);
            } catch (error) {
              console.error('获取用户信息失败，将使用本地模拟:', error);
              // 失败时不影响流程，dbUser为null继续走创建逻辑
            }
          }
          
          // 4. 不存在则创建用户
          if (!dbUser) {
            try {
              dbUser = await createUser({
                nickName: userInfoFromWx.nickName,
                avatarUrl: userInfoFromWx.avatarUrl,
                openid: openid,
                gender: userInfoFromWx.gender
              });
              
              console.log('创建用户成功，返回数据:', dbUser);
              
              if (!dbUser) {
                throw new Error('创建用户返回结果为空');
              }
            } catch (error) {
              console.error('创建用户失败，使用本地模拟用户:', error);
              // 创建失败时使用本地模拟
              dbUser = {
                _id: 'mock_user_id_' + Date.now(),
                nickname: userInfoFromWx.nickName,
                avatar_url: userInfoFromWx.avatarUrl,
                openid: openid,
                gender: userInfoFromWx.gender
              };
              
              // 持久化到本地
              const mockUsers = wx.getStorageSync('mockUsers') || [];
              mockUsers.push(dbUser);
              wx.setStorageSync('mockUsers', mockUsers);
            }
          } else {
            // 更新用户信息
            try {
              await updateUser(dbUser._id, {
                nickName: userInfoFromWx.nickName,
                avatarUrl: userInfoFromWx.avatarUrl,
                gender: userInfoFromWx.gender
              });
            } catch (error) {
              console.error('更新用户信息失败，但不影响登录流程:', error);
            }
          }
          
          // 5. 更新本地存储
          const userInfo = {
            _id: dbUser._id || dbUser.Id || dbUser.id || '',
            nickName: userInfoFromWx.nickName,
            avatarUrl: userInfoFromWx.avatarUrl,
            gender: userInfoFromWx.gender,
            openid: openid,
            bgImage: dbUser.bg_image || '',
            phone: dbUser.phone || ''
          };
          
          console.log('即将保存到本地的用户信息:', userInfo);
          
          // 设置token
          const mockToken = 'mock_token_' + Date.now();
          wx.setStorageSync('token', mockToken);
          wx.setStorageSync('userInfo', userInfo);
          
          wx.hideLoading();
          this.setData({
            isLogin: true,
            showLoginDialog: false
          });
          
          // 重新获取用户数据
          this.fetchData();
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        } catch (error) {
          wx.hideLoading();
          console.error('登录失败:', error);
          wx.showToast({
            title: '登录失败: ' + (error.message || '未知错误'),
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 关闭登录对话框
  closeLoginDialog() {
    this.setData({
      showLoginDialog: false
    });
  }
});
