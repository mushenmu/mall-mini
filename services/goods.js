const { get } = require('../utils/request');

// 首页聚合:轮播图 + 分类宫格 + 热门商品
function fetchHome() {
  return get('/api/home', {}, { cache: true, ttl: 300000 });
}

// 分类列表(两级树)
function fetchCategoryList() {
  return get('/api/category/list', {}, { cache: true, ttl: 600000 });
}

// 商品列表 / 搜索:{ keyword, categoryId, pageNum, pageSize, sort }
// sort: "" | sales | priceAsc | priceDesc
function fetchGoodsList(params) {
  return get('/api/goods/list', params);
}

// 商品详情
function fetchGoodsDetail(id) {
  return get('/api/goods/detail', { id }, { cache: true, ttl: 60000 });
}

// 热门搜索词
function fetchSearchPopular() {
  return get('/api/search/popular', {}, { cache: true, ttl: 600000 });
}

module.exports = { fetchHome, fetchCategoryList, fetchGoodsList, fetchGoodsDetail, fetchSearchPopular };
