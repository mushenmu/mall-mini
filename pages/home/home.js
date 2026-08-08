const { fetchHome, fetchGoodsList } = require('../../services/goods');

Page({
  data: {
    swiper: [],
    categoryList: [],
    hotGoods: [],
    loading: true,
  },

  onLoad() {
    this.loadAll();
  },

  onPullDownRefresh() {
    this.loadAll(() => wx.stopPullDownRefresh());
  },

  loadAll(done) {
    Promise.all([fetchHome(), fetchGoodsList({ pageNum: 1, pageSize: 10 })])
      .then(([home]) => {
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
        this.setData({ loading: false });
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
    wx.switchTab({ url: '/pages/goods/list' });
    if (id) {
      // 通过全局事件通知列表页选中该分类
      const app = getApp();
      if (app.globalData) app.globalData.pendingCategoryId = id;
    }
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/goods/list?keyword=' });
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },
});
