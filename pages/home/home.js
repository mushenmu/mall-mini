const { fetchHome } = require('../../services/goods');
const { invalidateCache } = require('../../utils/request');

Page({
  data: {
    swiper: [],
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
      sales: it.sales || 0,
      tags: it.tags || [],
    };
  },

  goGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` });
  },

  onBannerTap(e) {
    const { link } = e.currentTarget.dataset;
    if (!link) return;
    // 仅允许站内安全跳转:商品详情 / 商品列表(可带分类)
    const goodsDetail = link.match(/^\/?pages\/goods\/detail\?id=(\d+)$/);
    if (goodsDetail) {
      wx.navigateTo({ url: `/pages/goods/detail?id=${goodsDetail[1]}` });
      return;
    }
    const goodsList = link.match(/^\/?pages\/goods\/list(?:\?categoryId=(\w+))?$/);
    if (goodsList) {
      if (goodsList[1]) {
        getApp().globalData.pendingCategoryId = goodsList[1];
        wx.switchTab({ url: '/pages/goods/list' });
      } else {
        wx.switchTab({ url: '/pages/goods/list' });
      }
    }
  },

  goSearch() {
    wx.switchTab({ url: '/pages/goods/list' });
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  retry() {
    invalidateCache('/api/home');
    this.loadAll();
  },
});
