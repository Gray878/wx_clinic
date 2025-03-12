export const USER_ID = 'USER_MOCK';

export function createId() {
  return Array.from({ length: 16 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

export const SPU = [
  {
    owner: '1856254275343773698',
    priority: 1,
    swiper_images: ['https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png'],
    createdAt: 1731488370922,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '小时陪诊',
    detail:
      '<p style="text-align: center"><span style="font-size: 32px"><strong><span style="color: #45818e"><i><span style="text-decoration: underline">专业医护陪诊，按小时计费</span></i></span></strong></span></p><p style="text-align: center"><span class="exeditor-picture"><img src="https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png" width="356" height="356"></span></p><p style="text-align: center">专业人员一对一陪同</p><p style="text-align: center"><span style="font-family: STKaiti, 华文楷体, serif">优质服务!</span></p>',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png',
    icon_image: 'https://cdn-we-retail.ym.tencent.com/miniapp/ic_service_1.png',
    server_city: 'gz', // 广州
    _id: 'P4_prod',
    updatedAt: 1731488370922,
    status: 'ENABLED',
  },
  {
    owner: '1856254275343773698',
    priority: 2,
    swiper_images: ['https://qcloudimg.tencent-cloud.cn/raw/62eb1d8d8ea3b05302c199636f787438.png'],
    createdAt: 1731488370775,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '取送报告',
    detail:
      '<p style="text-align: center"><span style="font-size: 32px"><span style="background-color: #00ff00"><strong><span style="color: #ea9999"><i>专业医护代取、代送检查报告</i></span></strong></span></span></p><p style="text-align: center"><span class="exeditor-picture"><img src="https://qcloudimg.tencent-cloud.cn/raw/62eb1d8d8ea3b05302c199636f787438.png" width="356" height="356"></span></p><p style="text-align: center">放心委托</p>',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/62eb1d8d8ea3b05302c199636f787438.png',
    icon_image: 'https://cdn-we-retail.ym.tencent.com/miniapp/ic_service_2.png',
    server_city: 'gz', // 广州
    _id: 'P3_prod',
    updatedAt: 1731488370775,
    status: 'ENABLED',
  },
  {
    owner: '1856254275343773698',
    priority: 1,
    swiper_images: ['https://qcloudimg.tencent-cloud.cn/raw/7b2c975b21d24c43f1609e0b0328dccf.png'],
    createdAt: 1731488370653,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '检查陪同',
    detail:
      '<p style="text-align: center"><span style="font-size: 32px"><strong><span style="color: #ff9900"><i>医院检查全程陪同</i></span></strong></span></p><p style="text-align: center"><span class="exeditor-picture"><img src="https://qcloudimg.tencent-cloud.cn/raw/7b2c975b21d24c43f1609e0b0328dccf.png" width="356" height="356"></span></p><p style="text-align: center">贴心守护每一步</p>',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/7b2c975b21d24c43f1609e0b0328dccf.png',
    icon_image: 'https://cdn-we-retail.ym.tencent.com/miniapp/ic_service_3.png',
    server_city: 'fs', // 佛山
    _id: 'P2_prod',
    updatedAt: 1731488370653,
    status: 'ENABLED',
  },
  {
    owner: '1856254275343773698',
    priority: 1,
    swiper_images: ['https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png'],
    createdAt: 1731488370507,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '代办取药',
    detail:
      '<p style="text-align: right"><span style="font-size: 32px"><span style="background-color: #434343"><strong><span style="color: #ffffff"><i><span style="text-decoration: underline">便民服务</span></i></span></strong></span></span></p><p style="text-align: right"><span class="exeditor-picture"><img src="https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png" width="356" height="356"></span></p><p style="text-align: right">药品代购、代领服务</p>',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
    icon_image: 'https://cdn-we-retail.ym.tencent.com/miniapp/ic_service_4.png',
    server_city: 'fs', // 佛山
    _id: 'P1_prod',
    updatedAt: 1731488370507,
    status: 'ENABLED',
  },
  {
    owner: '1856254275343773698',
    priority: 3,
    swiper_images: ['https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png'],
    createdAt: 1731488370507,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '半天陪诊',
    detail:
      '<p style="text-align: center"><span style="font-size: 32px"><strong><span style="color: #45818e"><i><span style="text-decoration: underline">专业医护半天陪诊服务</span></i></span></strong></span></p><p style="text-align: center"><span class="exeditor-picture"><img src="https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png" width="356" height="356"></span></p><p style="text-align: center">4小时连续服务</p>',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
    icon_image: 'https://cdn-we-retail.ym.tencent.com/miniapp/ic_service_5.png',
    server_city: 'hz', // 惠州
    _id: 'P5_prod',
    updatedAt: 1731488370507,
    status: 'ENABLED',
  },
  {
    owner: '1856254275343773698',
    priority: 3,
    swiper_images: ['https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png'],
    createdAt: 1731488370507,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '全天陪诊',
    detail:
      '<p style="text-align: center"><span style="font-size: 32px"><strong><span style="color: #45818e"><i><span style="text-decoration: underline">专业医护全天陪诊服务</span></i></span></strong></span></p><p style="text-align: center"><span class="exeditor-picture"><img src="https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png" width="356" height="356"></span></p><p style="text-align: center">8小时连续服务</p>',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
    icon_image: 'https://cdn-we-retail.ym.tencent.com/miniapp/ic_service_6.png',
    server_city: 'hz', // 惠州
    _id: 'P6_prod',
    updatedAt: 1731488370507,
    status: 'ENABLED',
  }
];

export const SKU = [
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png',
    createdAt: 1731488370290,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    price: 190,
    _openid: '1856254275343773698',
    count: 100,
    description: '专业医护陪诊，按小时计费',
    spu: { _id: 'P4_prod' },
    _id: 'K6_prod',
    updatedAt: 1731488370290,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png',
    createdAt: 1731488370145,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    price: 100,
    _openid: '1856254275343773698',
    count: 100,
    description: '专业医护代取、代送检查报告',
    spu: { _id: 'P3_prod' },
    _id: 'K5_prod',
    updatedAt: 1731488370145,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/7b2c975b21d24c43f1609e0b0328dccf.png',
    createdAt: 1731488370002,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    price: 150,
    _openid: '1856254275343773698',
    count: 100,
    description: '医院检查全程陪同',
    spu: { _id: 'P2_prod' },
    _id: 'K3_prod',
    updatedAt: 1731488370002,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
    createdAt: 1731488369861,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    price: 80,
    _openid: '1856254275343773698',
    count: 100,
    description: '药品代购、代领服务',
    spu: { _id: 'P1_prod' },
    _id: 'K2_prod',
    updatedAt: 1731488369861,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
    createdAt: 1731488369861,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    price: 450,
    _openid: '1856254275343773698',
    count: 100,
    description: '专业医护半天陪诊服务，4小时连续服务',
    spu: { _id: 'P5_prod' },
    _id: 'K7_prod',
    updatedAt: 1731488369861,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
    createdAt: 1731488369861,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    price: 800,
    _openid: '1856254275343773698',
    count: 100,
    description: '专业医护全天陪诊服务，8小时连续服务',
    spu: { _id: 'P6_prod' },
    _id: 'K8_prod',
    updatedAt: 1731488369861,
  },
];

export const HOME_SWIPER = [
  {
    images: ['https://qcloudimg.tencent-cloud.cn/raw/1e793c70bb4f521fe277b2c207ab81b4.png'],
    _id: 'A3QFLT6UVN',
  },
];

export const CATEGORY = [
  {
    owner: '1856254275343773698',
    createdAt: 1731488367747,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '数码',
    spu: [],
    _id: 'C3_prod',
    child_cate: [
      {
        image: 'https://qcloudimg.tencent-cloud.cn/raw/7b2c975b21d24c43f1609e0b0328dccf.png',
        name: '音箱',
        _id: 'ACGNME9W2U',
      },
    ],
    updatedAt: 1731488367747,
  },
  {
    owner: '1856254275343773698',
    createdAt: 1731488367429,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '周边',
    spu: [],
    _id: 'C2_prod',
    child_cate: [
      {
        image: 'https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png',
        name: '摆件',
        _id: 'ACGNMD7TRS',
      },
    ],
    updatedAt: 1731488367429,
  },
  {
    owner: '1856254275343773698',
    createdAt: 1731488366964,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '服饰',
    spu: [],
    _id: 'C1_prod',
    child_cate: [
      {
        image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
        name: '箱包',
        _id: 'ACGNMBTP4L',
      },
      {
        image: 'https://qcloudimg.tencent-cloud.cn/raw/62eb1d8d8ea3b05302c199636f787438.png',
        name: '鞋子',
        _id: 'ACGNMCB9N8',
      },
    ],
    updatedAt: 1731488366964,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/7b2c975b21d24c43f1609e0b0328dccf.png',
    createdAt: 1731488367913,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '音箱',
    spu: [{ _id: 'P2_prod' }],
    _id: 'ACGNME9W2U',
    child_cate: [],
    updatedAt: 1731488367913,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/063123361b3a397f4ba6894591c3a006.png',
    createdAt: 1731488367571,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '摆件',
    spu: [{ _id: 'P4_prod' }],
    _id: 'ACGNMD7TRS',
    child_cate: [],
    updatedAt: 1731488367571,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/62eb1d8d8ea3b05302c199636f787438.png',
    createdAt: 1731488367273,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '鞋子',
    spu: [{ _id: 'P3_prod' }],
    _id: 'ACGNMCB9N8',
    child_cate: [],
    updatedAt: 1731488367273,
  },
  {
    owner: '1856254275343773698',
    image: 'https://qcloudimg.tencent-cloud.cn/raw/ac3c9a255cae575661323fdcb8cae468.png',
    createdAt: 1731488367108,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    _openid: '1856254275343773698',
    name: '箱包',
    spu: [{ _id: 'P1_prod' }],
    _id: 'ACGNMBTP4L',
    child_cate: [],
    updatedAt: 1731488367108,
  },
];

export const ATTR_VALUE = [
  {
    owner: '1856254275343773698',
    createdAt: 1731488369101,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    attr_name: { name: '数量', _id: 'N2_prod' },
    _openid: '1856254275343773698',
    _id: 'V4_prod',
    sku: [{ _id: 'K6_prod' }],
    value: '2 个',
    updatedAt: 1731488369101,
  },
  {
    owner: '1856254275343773698',
    createdAt: 1731488368972,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    attr_name: { name: '数量', _id: 'N2_prod' },
    _openid: '1856254275343773698',
    _id: 'V3_prod',
    sku: [{ _id: 'K5_prod' }],
    value: '1 个',
    updatedAt: 1731488368972,
  },
  {
    owner: '1856254275343773698',
    createdAt: 1731488368836,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    attr_name: { name: '尺码', _id: 'N1_prod' },
    _openid: '1856254275343773698',
    _id: 'V2_prod',
    sku: [{ _id: 'K4_prod' }],
    value: '34 码',
    updatedAt: 1731488368836,
  },
  {
    owner: '1856254275343773698',
    createdAt: 1731488368490,
    createBy: '1856254275343773698',
    updateBy: '1856254275343773698',
    attr_name: { name: '尺码', _id: 'N1_prod' },
    _openid: '1856254275343773698',
    _id: 'V1_prod',
    sku: [{ _id: 'K3_prod' }],
    value: '33 码',
    updatedAt: 1731488368490,
  },
];

export const COMMENTS = [
  {
    owner: '1788891669799862274',
    createdAt: 1728899184779,
    createBy: '1788891669799862274',
    updateBy: '1788891669799862274',
    order_item: {
      _id: 'A6JRQ0YB2G',
    },
    spu: {
      _id: 'A3QFLUSAK2',
    },
    _openid: '1788891669799862274',
    rating: 5,
    _id: 'A6JRGRT6U8',
    reply: '',
    content: '好好好',
    updatedAt: 1728899339993,
  },
];
COMMENTS.pop(); // 默认没数据，先塞后清是为了有编辑器提示

export const CART_ITEM = [
  {
    count: 8,
    _id: 'A6JQYSJJSL',
    sku: {
      _id: 'A3QFLRCZFW',
    },
  },
];

CART_ITEM.pop();

export const DELIVERY_INFO = [
  {
    name: '客人a',
    address: '深圳湾一号',
    _id: 'A6JRPE3NYG',
    phone: '13858585858',
  },
];

DELIVERY_INFO.pop();

export const ORDER = [
  {
    status: '',
    delivery_info: { _id: '' },
    _id: '',
  },
];

ORDER.pop();

export const ORDER_ITEM = [
  {
    count: 0,
    sku: {
      _id: '',
    },
    order: {
      _id: '',
    },
    _id: '',
  },
];

ORDER_ITEM.pop();

export const COUPONS = [
  {
    _id: 'coupon_001',
    name: '满100减10券',
    type: 1,
    amount: 10,
    minConsume: 10000,
    description: '全场通用优惠券',
    startTime: Date.now(),
    endTime: Date.now() + 30*24*60*60*1000,
    status: 1
  },
  {
    _id: 'coupon_002',
    name: '9折优惠券',
    type: 2,
    amount: 0.9,
    minConsume: 5000,
    description: '全场通用折扣券',
    startTime: Date.now(),
    endTime: Date.now() + 15*24*60*60*1000,
    status: 1
  }
];

export const USER_COUPONS = [
  {
    _id: 'user_coupon_001',
    user: USER_ID,
    coupon: COUPONS[0],
    status: 1,
    receiveTime: Date.now() - 5*24*60*60*1000,
    expireTime: Date.now() + 25*24*60*60*1000
  },
  {
    _id: 'user_coupon_002',
    user: USER_ID,
    coupon: COUPONS[1],
    status: 1,
    receiveTime: Date.now() - 2*24*60*60*1000,
    expireTime: Date.now() + 13*24*60*60*1000
  }
];
