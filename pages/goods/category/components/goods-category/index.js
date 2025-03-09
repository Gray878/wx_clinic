import { getAllSpuOfCate } from '../../../../../services/cate/cate';
import { getCloudImageTempUrl } from '../../../../../utils/cloudImageHandler';

Component({
  externalClasses: ['custom-class'],

  properties: {
    category: {
      type: Array,
    },
    initActive: {
      type: Array,
      value: [],
      observer(newVal, oldVal) {
        if (newVal[0] !== oldVal[0]) {
          this.setActiveKey(newVal[0], 0);
        }
      },
    },
    isSlotRight: {
      type: Boolean,
      value: false,
    },
    level: {
      type: Number,
      value: 2,
    },
  },
  data: {
    activeKey: 0,
    subActiveKey: 0,
    spuList: [],
    loading: false,
  },
  attached() {
    if (this.properties.initActive && this.properties.initActive.length > 0) {
      this.setData({
        activeKey: this.properties.initActive[0],
        subActiveKey: this.properties.initActive[1] || 0,
      });
    }
  },
  
  observers: {
    'activeKey, category': function(activeKey, category) {
      if (category && category.length > 0) {
        const currentCate = category[activeKey];
        if (currentCate && (!currentCate.child_cate || currentCate.child_cate.length === 0)) {
          this.fetchSpuList(currentCate._id);
        }
      }
    },
  },
  
  methods: {
    onParentChange(event) {
      this.setActiveKey(event.detail.index, 0).then(() => {
        this.triggerEvent('change', [this.data.activeKey, this.data.subActiveKey]);
      });
    },
    onChildChange(event) {
      this.setActiveKey(this.data.activeKey, event.detail.index).then(() => {
        this.triggerEvent('change', [this.data.activeKey, this.data.subActiveKey]);
      });
    },
    changCategory(event) {
      const { item } = event.currentTarget.dataset;
      this.triggerEvent('changeCategory', {
        item,
      });
    },
    setActiveKey(key, subKey) {
      return new Promise((resolve) => {
        this.setData(
          {
            activeKey: key,
            subActiveKey: subKey,
          },
          () => {
            resolve();
          },
        );
      });
    },
    
    async fetchSpuList(cateId) {
      if (!cateId) return;
      
      this.setData({ loading: true });
      try {
        const result = await getAllSpuOfCate(cateId);
        if (result && result.spu) {
          const spuWithImages = await this.processSpuImages(result.spu);
          this.setData({ spuList: spuWithImages });
        } else {
          this.setData({ spuList: [] });
        }
      } catch (error) {
        console.error('获取SPU列表失败', error);
        wx.showToast({
          title: '获取服务列表失败',
          icon: 'none',
        });
        this.setData({ spuList: [] });
      } finally {
        this.setData({ loading: false });
      }
    },
    
    async processSpuImages(spuList) {
      try {
        const imageUrls = [];
        spuList.forEach(spu => {
          if (spu.swiper_images && spu.swiper_images.length > 0) {
            imageUrls.push(spu.swiper_images[0]);
          }
        });
        
        if (imageUrls.length > 0) {
          const tempUrls = await getCloudImageTempUrl(imageUrls);
          
          let tempUrlIndex = 0;
          return spuList.map(spu => {
            if (spu.swiper_images && spu.swiper_images.length > 0) {
              spu.swiper_images[0] = tempUrls[tempUrlIndex++] || spu.swiper_images[0];
            }
            return spu;
          });
        }
      } catch (error) {
        console.error('处理商品图片失败', error);
      }
      
      return spuList;
    },
    
    onTapSpu(e) {
      const { spu } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/goods/details/index?spuId=${spu._id}`,
      });
    },
    
    onTapOrder(e) {
      const { spu } = e.currentTarget.dataset;
      e.stopPropagation();
      wx.navigateTo({
        url: `/pages/order/fill-order/index?spuId=${spu._id}`,
      });
    },
  },
});
