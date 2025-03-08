import updateManager from './common/updateManager';
import { init } from '@cloudbase/wx-cloud-client-sdk';
import { checkLogin } from './services/user/user';

wx.cloud.init({
  env: 'labmanage-9g4x9uti5b5c8a99', // 指定云开发环境 ID
});

const client = init(wx.cloud);
const models = client.models;
globalThis.dataModel = models;
// 接下来就可以调用 models 上的数据模型增删改查等方法了

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

  onShow: function () {
    updateManager();
  },
});
