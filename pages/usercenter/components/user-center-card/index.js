Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    userInfo: {
      type: Object,
      value: {}
    },
    isPhoneHide: {
      type: Boolean,
      value: true
    },
    nameClass: {
      type: String,
      value: ''
    },
    phoneClass: {
      type: String,
      value: ''
    },
    avatarClass: {
      type: String,
      value: ''
    },
    backgroundImage: {
      type: String,
      value: ''
    }
  },

  data: {
    defaultAvatarUrl: 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user-center-avatar@2x.png',
    phoneNumber: '',
    defaultBackgroundImage: 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/user-center-bg.png'
  },

  observers: {
    'userInfo.phoneNumber, isPhoneHide': function(phoneNumber, isPhoneHide) {
      if (phoneNumber) {
        this.setData({
          phoneNumber: isPhoneHide ? 
            phoneNumber.substring(0, 3) + '****' + phoneNumber.substring(7) : 
            phoneNumber
        });
      }
    }
  },

  methods: {
    gotoUserDetail() {
      this.triggerEvent('gotoUserDetail');
    }
  }
});
