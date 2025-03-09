// 网页浏览器页面
Page({
  data: {
    url: '', // 要加载的URL
    loading: true
  },

  onLoad(options) {
    if (options.url) {
      try {
        // 解码URL
        const decodedUrl = decodeURIComponent(options.url);
        console.log('加载网页:', decodedUrl);
        
        this.setData({
          url: decodedUrl,
          loading: false
        });
      } catch (error) {
        console.error('URL解码错误:', error);
        this.showError('无效的URL');
      }
    } else {
      this.showError('缺少URL参数');
    }
  },
  
  // 网页加载完成
  onWebviewLoad() {
    this.setData({ loading: false });
  },
  
  // 网页加载出错
  onWebviewError(e) {
    console.error('网页加载失败:', e.detail);
    this.showError('加载失败');
  },
  
  // 显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
    
    // 两秒后返回
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 2000);
  }
}); 