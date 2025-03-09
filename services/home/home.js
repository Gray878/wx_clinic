import { model } from '../_utils/model';
import { DATA_MODEL_KEY } from '../../config/model';
import { cloudbaseTemplateConfig } from '../../config/index';
import { HOME_SWIPER } from '../cloudbaseMock/index';

const HOME_SWIPER_MODEL_KEY = DATA_MODEL_KEY.HOME_SWIPER;

export async function getHomeSwiper() {
  if (cloudbaseTemplateConfig.useMock) {
    return HOME_SWIPER[0];
  }

  const result = await model()[HOME_SWIPER_MODEL_KEY].list();
  console.log('轮播图原始数据:', result.data.records);

  return {
    images: result.data.records.map(item => {
      console.log('处理轮播图项:', item);
      return {
        // 图片字段可能是不同名称，检查多种可能性
        image: item.image || '',
        title: item.title || '',
        url: item.img_url || '',  // 使用img_url作为跳转链接
        img_url: item.img_url || ''
      };
    })
  };
}
