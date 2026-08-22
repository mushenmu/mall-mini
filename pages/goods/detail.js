const { fetchGoodsDetail } = require('../../services/goods');
const { addToCart } = require('../../services/cart');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    id: null,
    goods: null,
    quantity: 1,
    loading: true,
    cartCount: 0,
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.load();
  },

  onShow() {
    if (this.data.id) {
      // 返回时刷新购物车角标(简单展示)
      this.loadCartCount();
    }
  },

  load() {
    fetchGoodsDetail(this.data.id)
      .then((g) => {
        this.setData({
          goods: this.formatGoods(g),
          loading: false,
        });
        wx.setNavigationBarTitle({ title: g.title.slice(0, 12) });
      })
      .catch((err) => {
        console.error('商品详情加载失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: '商品不存在或已下架', icon: 'none' });
      });
  },

  formatGoods(g) {
    return {
      id: g.id,
      title: g.title,
      subtitle: g.subtitle,
      images: (g.images && g.images.length ? g.images : [g.image]),
      price: (parseInt(g.price, 10) || 0) / 100,
      stock: g.stock || 0,
      sales: g.sales || 0,
      tags: g.tags || [],
      detail: g.detail || '',
    };
  },

  loadCartCount() {
    // 轻量展示:购物车数量在购物车页为准,这里不再单独拉取
  },

  // 数量选择
  onMinus() {
    if (this.data.quantity <= 1) return;
    this.setData({ quantity: this.data.quantity - 1 });
  },

  onPlus() {
    if (!this.data.goods) return;
    const stock = this.data.goods.stock;
    if (this.data.quantity >= stock) {
      wx.showToast({ title: '已达库存上限', icon: 'none' });
      return;
    }
    this.setData({ quantity: this.data.quantity + 1 });
  },

  // 加入购物车
  addCart() {
    if (!this.data.goods) return;
    const { id, stock } = this.data.goods;
    if (!stock) {
      wx.showToast({ title: '商品已售罄', icon: 'none' });
      return;
    }
    addToCart(getUid(), id, this.data.quantity)
      .then(() => {
        wx.showToast({ title: '已加入购物车', icon: 'success' });
      })
      .catch((err) => wx.showToast({ title: err.message || '加入失败', icon: 'none' }));
  },

  // 立即购买:直接去结算页
  buyNow() {
    if (!this.data.goods) return;
    const { id, stock } = this.data.goods;
    if (!stock) {
      wx.showToast({ title: '商品已售罄', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/order/confirm?productId=${id}&quantity=${this.data.quantity}`,
    });
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },
});
