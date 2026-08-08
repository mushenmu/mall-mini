const { get } = require('../utils/request');

// 首页聚合:轮播图 + 分类宫格 + 热门商品
function fetchHome() {
  return get('/api/home');
}

// 分类列表(两级树)
function fetchCategoryList() {
  return get('/api/category/list');
}

// 商品列表 / 搜索:{ keyword, categoryId, pageNum, pageSize, sort }
// sort: "" | sales | priceAsc | priceDesc
function fetchGoodsList(params) {
  return get('/api/goods/list', params);
}

// 商品详情
function fetchGoodsDetail(id) {
  return get('/api/goods/detail', { id });
}

// 热门搜索词
function fetchSearchPopular() {
  return get('/api/search/popular');
}

module.exports = { fetchHome, fetchCategoryList, fetchGoodsList, fetchGoodsDetail, fetchSearchPopular };
