const { fetchCart, updateCartItem, deleteCartItems } = require('../../services/cart');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    list: [],
    total: 0,
    allSelected: false,
    loading: true,
    error: '',
  },

  onShow() {
    this.load();
  },

  onPullDownRefresh() {
    this.load(() => wx.stopPullDownRefresh());
  },

  load(done) {
    this.setData({ loading: true, error: '' });
    fetchCart(getUid())
      .then((res) => {
        const list = (res.list || []).map((g) => ({
          id: g.id,
          productId: g.productId,
          title: g.title,
          image: g.image,
          price: (parseInt(g.price, 10) || 0) / 100,
          quantity: g.quantity,
          isSelected: !!g.isSelected,
          stock: g.stock || 0,
        }));
        this.setData({ list, loading: false });
        this.calc();
        if (done) done();
      })
      .catch((err) => {
        console.error('购物车加载失败', err);
        this.setData({ loading: false, error: err.message || '购物车加载失败' });
        if (done) done();
      });
  },

  calc() {
    let total = 0;
    let selectedCount = 0;
    let all = this.data.list.length > 0;
    this.data.list.forEach((g) => {
      if (g.isSelected) {
        total += g.price * g.quantity;
        selectedCount += 1;
      } else {
        all = false;
      }
    });
    this.setData({ total, allSelected: all, selectedCount });
  },

  toggle(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.list[index];
    const next = !item.isSelected;
    this.updateItem(item.id, { isSelected: next }, index);
  },

  toggleAll() {
    const next = !this.data.allSelected;
    const list = this.data.list.map((g) => Object.assign({}, g, { isSelected: next }));
    this.setData({ list, allSelected: next });
    this.calc();
    // 逐条同步后端
    list.forEach((g) => {
      updateCartItem(getUid(), g.id, { isSelected: g.isSelected }).catch(() => {});
    });
  },

  updateItem(id, patch, index) {
    updateCartItem(getUid(), id, patch)
      .then(() => {
        const list = this.data.list.slice();
        if (index !== undefined) {
          list[index] = Object.assign({}, list[index], patch);
          this.setData({ list });
          this.calc();
        }
      })
      .catch((err) => wx.showToast({ title: err.message || '操作失败', icon: 'none' }));
  },

  onMinus(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.list[index];
    if (item.quantity <= 1) return;
    this.updateItem(item.id, { quantity: item.quantity - 1 }, index);
  },

  onPlus(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.list[index];
    if (item.quantity >= item.stock) {
      wx.showToast({ title: '已达库存上限', icon: 'none' });
      return;
    }
    this.updateItem(item.id, { quantity: item.quantity + 1 }, index);
  },

  onDelete(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.list[index];
    wx.showModal({
      title: '提示',
      content: '确定删除该商品吗?',
      success: (res) => {
        if (!res.confirm) return;
        deleteCartItems(getUid(), [item.id])
          .then(() => {
            const list = this.data.list.slice();
            list.splice(index, 1);
            this.setData({ list });
            this.calc();
          })
          .catch((err) => wx.showToast({ title: err.message || '删除失败', icon: 'none' }));
      },
    });
  },

  goGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` });
  },

  retry() {
    this.load();
  },

  goShopping() {
    wx.switchTab({ url: '/pages/goods/list' });
  },

  goSettle() {
    const sel = this.data.list.filter((g) => g.isSelected);
    if (!sel.length) {
      wx.showToast({ title: '请先选择商品', icon: 'none' });
      return;
    }
    // 把选中的购物车条目带到结算页(JSON 序列化,控制长度)
    const payload = sel.map((g) => ({
      productId: g.productId,
      quantity: g.quantity,
    }));
    const qs = `items=${encodeURIComponent(JSON.stringify(payload))}`;
    wx.navigateTo({ url: `/pages/order/confirm?${qs}&fromCart=1` });
  },
});
