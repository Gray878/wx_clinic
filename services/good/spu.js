import { model } from '../_utils/model';
import { getCloudImageTempUrl } from '../../utils/cloudImageHandler';
import { SPU_SELLING_STATUS } from '../../utils/spuStatus';
import { DATA_MODEL_KEY } from '../../config/model';
import { cloudbaseTemplateConfig } from '../../config/index';
import { SPU, SKU } from '../cloudbaseMock/index';
import { ENABLE_SERVER_CITY_FILTER } from '../city/city';

const SPU_MODEL_KEY = DATA_MODEL_KEY.SPU;
const SKU_MODEL_KEY = DATA_MODEL_KEY.SKU;
const CITY_MODEL_KEY = DATA_MODEL_KEY.CITY;

/**
 *
 * @param {{
 *   pageSize: Number,
 *   pageNumber: Number,
 *   cateId: String,
 *   search: String,
 *   server_city: String 城市代码，用于筛选特定城市的服务
 * }}} param0
 * @returns
 */
export async function listGood({ pageSize, pageNumber, search, server_city }) {
  if (cloudbaseTemplateConfig.useMock) {
    let records = search ? SPU.filter((x) => x.name.includes(search)) : SPU;
    
    // 本地模拟数据的城市筛选
    if (server_city) {
      records = records.filter(spu => {
        // 如果SPU有server_city字段，则按城市筛选
        if (spu.server_city) {
          return spu.server_city === server_city;
        }
        // 如果没有，则所有城市都可见
        return true;
      });
    }
    
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      records: records.slice(startIndex, endIndex),
      total: records.length,
    };
  }
  
  const filter = {
    where: {
      status: { $eq: SPU_SELLING_STATUS },
    },
  };
  
  if (search) {
    filter.where.name = { $search: search };
  }
  
  // 如果指定了城市代码，添加城市关联查询
  if (server_city) {
    // 构建关联查询，使用正确的关系模型
    filter.relateWhere = {
      server_city: {
        where: {
          code: { $eq: server_city }
        }
      }
    };
  }

  try {
    return (
      await model()[SPU_MODEL_KEY].list({
        filter,
        pageSize,
        pageNumber,
        getCount: true,
        orderBy: [{ priority: 'desc' }],
      })
    ).data;
  } catch (error) {
    console.error('查询服务列表失败:', error);
    // 如果查询失败，返回空结果
    return {
      records: [],
      total: 0
    };
  }
}

export async function getPrice(spuId) {
  if (cloudbaseTemplateConfig.useMock) {
    return SKU.find((x) => x.spu._id === spuId).price;
  }
  const {
    data: { records },
  } = await model()[SKU_MODEL_KEY].list({
    filter: {
      where: {
        spu: {
          $eq: spuId,
        },
      },
    },
    select: {
      $master: true,
      spu: {
        _id: true,
      },
    },
  });
  return records[0].price;
}

export async function handleSpuCloudImage(spu) {
  if (spu == null) {
    return;
  }
  const handledImages = await getCloudImageTempUrl([spu.cover_image, ...spu.swiper_images]);
  handledImages.forEach((image, index) => {
    if (index === 0) {
      spu.cover_image = image;
      return;
    }
    spu.swiper_images[index - 1] = image;
  });
}

export async function getSpu(spuId) {
  if (cloudbaseTemplateConfig.useMock) {
    return SPU.find((x) => x._id === spuId);
  }
  return (
    await model()[SPU_MODEL_KEY].get({
      filter: {
        where: { _id: { $eq: spuId } },
      },
    })
  ).data;
}
