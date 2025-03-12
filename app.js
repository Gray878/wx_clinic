import updateManager from './common/updateManager';
import { init } from '@cloudbase/wx-cloud-client-sdk';
import { checkLogin } from './services/user/user';

// 初始化云开发环境
wx.cloud.init({
  env: 'labmanage-9g4x9uti5b5c8a99', // 指定云开发环境 ID
});

// 使用解构赋值优化代码
const { models } = init(wx.cloud);
globalThis.dataModel = models;

App({
  onLaunch() {
    this.checkLoginStatus();
  },

  async checkLoginStatus() {
    const isLoggedIn = await checkLogin();
    this.globalData.isLoggedIn = isLoggedIn;
  },

  globalData: {
    isLoggedIn: false
  },

  onShow() {
    updateManager();
  },
});
