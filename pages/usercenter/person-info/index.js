import { updateUser } from '../../../services/user/user';

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      _id: '',
      phone: '',
      bgImage: ''
    }
  },

  onLoad() {
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: {
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          _id: userInfo._id,
          phone: userInfo.phone || '',
          bgImage: userInfo.bgImage || ''
        }
      });
    }
  },

  // 上传图片到云存储
  async uploadToCloud(tempFilePath, type = 'avatar') {
    try {
      wx.showLoading({
        title: '上传中...',
        mask: true
      });

      // 生成云存储路径
      const cloudPath = `user/${this.data.userInfo._id}/${type}_${Date.now()}${tempFilePath.match(/\.[^.]+?$/)[0]}`;

      // 上传文件
      const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      });

      wx.hideLoading();
      
      if (res.fileID) {
        return res.fileID;
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
      console.error('上传图片失败:', error);
      return null;
    }
  },

  // 选择头像
  async onChooseAvatar() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      const tempFilePath = res.tempFilePaths[0];
      
      // 上传到云存储
      const fileID = await this.uploadToCloud(tempFilePath, 'avatar');
      
      if (fileID) {
        // 更新头像URL
        this.setData({
          'userInfo.avatarUrl': fileID
        });
        
        wx.showToast({
          title: '头像已更新',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('选择头像失败:', error);
      wx.showToast({
        title: '选择头像失败',
        icon: 'none'
      });
    }
  },

  // 选择背景图片
  async onChooseBackgroundImage() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      const tempFilePath = res.tempFilePaths[0];
      
      // 上传到云存储
      const fileID = await this.uploadToCloud(tempFilePath, 'background');
      
      if (fileID) {
        // 更新背景图片URL
        this.setData({
          'userInfo.bgImage': fileID
        });
        
        wx.showToast({
          title: '背景已更新',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('选择背景图片失败:', error);
      wx.showToast({
        title: '选择背景图片失败',
        icon: 'none'
      });
    }
  },

  // 输入昵称
  onInputNickName(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    });
  },

  // 输入手机号
  onInputPhone(e) {
    this.setData({
      'userInfo.phone': e.detail.value
    });
  },

  // 验证手机号格式
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 保存信息
  async onSave() {
    const { userInfo } = this.data;
    
    // 验证昵称
    if (!userInfo.nickName || userInfo.nickName.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    // 验证手机号（如果有输入）
    if (userInfo.phone && !this.validatePhone(userInfo.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    try {
      // 保存到云数据库
      const userId = userInfo._id;
      if (!userId) {
        throw new Error('用户ID不存在');
      }

      // 更新用户信息
      const updateResult = await updateUser(userId, {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        phone: userInfo.phone,
        bgImage: userInfo.bgImage
      });

      if (!updateResult) {
        throw new Error('更新用户信息失败');
      }

      // 保存到本地存储（确保本地缓存与云端同步）
      const localUserInfo = wx.getStorageSync('userInfo');
      if (localUserInfo) {
        wx.setStorageSync('userInfo', {
          ...localUserInfo,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          phone: userInfo.phone,
          bgImage: userInfo.bgImage
        });
      }

      // 更新全局登录状态
      getApp().globalData.isLoggedIn = true;

      // 隐藏加载提示
      wx.hideLoading();

      wx.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          // 延迟返回上一页，确保toast能够显示
          setTimeout(() => {
            // 返回上一页并刷新
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            // 更新上一页的数据
            if (prevPage) {
              prevPage.setData({
                userInfo: {
                  ...prevPage.data.userInfo,
                  avatarUrl: userInfo.avatarUrl,
                  nickName: userInfo.nickName,
                  phone: userInfo.phone,
                  bgImage: userInfo.bgImage
                }
              });
              // 触发上一页的onShow方法，刷新数据
              if (typeof prevPage.onShow === 'function') {
                prevPage.onShow();
              }
            }
            wx.navigateBack();
          }, 1500);
        }
      });
    } catch (error) {
      console.error('保存用户信息失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: `保存失败: ${error.message}`,
        icon: 'none'
      });
    }
  }
});
