import { updateUser } from '../../../services/user/user';

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      _id: '',
      phone: '',
      bgImage: '',
      gender: 0 // 0: 未知, 1: 男, 2: 女
    },
    genderText: '未设置',
    showGenderPicker: false,
    genderOptions: ['男', '女', '未知']
  },

  onLoad() {
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 设置性别显示文本
      let genderText = '未设置';
      if (userInfo.gender === 1) {
        genderText = '男';
      } else if (userInfo.gender === 2) {
        genderText = '女';
      } else if (userInfo.gender === 0) {
        genderText = '未知';
      }
      
      this.setData({
        userInfo: {
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          _id: userInfo._id,
          phone: userInfo.phone || '',
          bgImage: userInfo.bgImage || '',
          gender: userInfo.gender || 0
        },
        genderText: genderText
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
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
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
  onNicknameChange(e) {
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

  // 点击性别选择区域
  onTapGender() {
    wx.showActionSheet({
      itemList: this.data.genderOptions,
      success: (res) => {
        const index = res.tapIndex;
        let gender = 0;
        let genderText = '';
        
        // 根据选择设置性别值和文本
        if (index === 0) { // 男
          gender = 1;
          genderText = '男';
        } else if (index === 1) { // 女
          gender = 2;
          genderText = '女';
        } else { // 不公开
          gender = 0;
          genderText = '不公开';
        }
        
        this.setData({
          'userInfo.gender': gender,
          genderText: genderText
        });
      }
    });
  },

  // 保存信息
  async onSave() {
    try {
      // 验证数据
      if (!this.data.userInfo.nickName.trim()) {
        wx.showToast({
          title: '昵称不能为空',
          icon: 'none'
        });
        return;
      }
      
      if (this.data.userInfo.phone && !this.validatePhone(this.data.userInfo.phone)) {
        wx.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        });
        return;
      }
      
      wx.showLoading({
        title: '保存中...',
        mask: true
      });
      
      // 准备要更新的数据
      const updateData = {
        nickName: this.data.userInfo.nickName,
        avatarUrl: this.data.userInfo.avatarUrl,
        phone: this.data.userInfo.phone,
        bgImage: this.data.userInfo.bgImage,
        gender: this.data.userInfo.gender
      };

      // 保存到云数据库
      const userId = this.data.userInfo._id;
      if (!userId) {
        throw new Error('用户ID不存在');
      }

      // 更新用户信息
      const updateResult = await updateUser(userId, updateData);

      if (!updateResult) {
        throw new Error('更新用户信息失败');
      }

      // 保存到本地存储（确保本地缓存与云端同步）
      const localUserInfo = wx.getStorageSync('userInfo');
      if (localUserInfo) {
        wx.setStorageSync('userInfo', {
          ...localUserInfo,
          nickName: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl,
          phone: this.data.userInfo.phone,
          bgImage: this.data.userInfo.bgImage,
          gender: this.data.userInfo.gender
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
                  avatarUrl: this.data.userInfo.avatarUrl,
                  nickName: this.data.userInfo.nickName,
                  phone: this.data.userInfo.phone,
                  bgImage: this.data.userInfo.bgImage,
                  gender: this.data.userInfo.gender
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
