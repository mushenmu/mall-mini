const { fetchHome } = require('../../services/goods');
const { invalidateCache } = require('../../utils/request');

Page({
  data: {
    swiper: [],
    categoryList: [],
    hotGoods: [],
    loading: true,
    error: '',
  },

  onLoad() {
    this.loadAll();
  },

  onPullDownRefresh() {
    invalidateCache('/api/home');
    this.loadAll(() => wx.stopPullDownRefresh());
  },

  loadAll(done) {
    this.setData({ loading: true, error: '' });
    fetchHome()
      .then((home) => {
        const goods = (home.hotGoods || []).map((it) => this.formatGoods(it));
        this.setData({
          swiper: home.swiper || [],
          categoryList: home.categoryList || [],
          hotGoods: goods,
          loading: false,
        });
        if (done) done();
      })
      .catch((err) => {
        console.error('首页加载失败', err);
        this.setData({ loading: false, error: err.message || '网络开小差了' });
        if (done) done();
      });
  },

  // 后端价格以「分」存储,转「元」
  formatGoods(it) {
    return {
      id: it.id,
      title: it.title,
      subtitle: it.subtitle,
      image: it.image,
      price: (parseInt(it.price, 10) || 0) / 100,
      originalPrice: (parseInt(it.originalPrice, 10) || 0) / 100,
      tags: it.tags || [],
    };
  },

  goGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` });
  },

  goCategory(e) {
    const { id } = e.currentTarget.dataset;
    if (id) {
      // 通过全局事件通知列表页选中该分类
      const app = getApp();
      if (app.globalData) app.globalData.pendingCategoryId = id;
    }
    wx.switchTab({ url: '/pages/goods/list' });
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/goods/list?keyword=' });
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  retry() {
    invalidateCache('/api/home');
    this.loadAll();
  },
});
