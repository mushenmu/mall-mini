const { fetchGoodsDetail } = require('../../services/goods');
const { fetchAddressList } = require('../../services/address');
const { commitOrder } = require('../../services/order');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    items: [],           // [{ productId, quantity, goods 详情快照 }]
    address: null,       // 当前选中地址
    addressList: [],
    remark: '',
    totalAmount: 0,
    submitting: false,
    fromCart: false,
  },

  onLoad(options) {
    let items = [];
    let fromCart = false;
    if (options.items) {
      try {
        items = JSON.parse(decodeURIComponent(options.items));
        fromCart = true;
      } catch (e) {
        console.error('解析结算参数失败', e);
      }
    } else if (options.productId) {
      items = [{ productId: options.productId, quantity: parseInt(options.quantity, 10) || 1 }];
    }
    this.setData({ items, fromCart });
    this.loadGoods(items);
    this.loadAddresses();
  },

  loadGoods(items) {
    // 逐件拉详情,组装结算清单
    const jobs = items.map((it) =>
      fetchGoodsDetail(it.productId).then((g) => ({
        productId: g.id,
        quantity: it.quantity,
        title: g.title,
        image: g.image,
        price: (parseInt(g.price, 10) || 0) / 100,
        stock: g.stock || 0,
      }))
    );
    Promise.all(jobs)
      .then((list) => {
        let totalAmount = 0;
        list.forEach((g) => { totalAmount += g.price * g.quantity; });
        this.setData({ items: list, totalAmount });
      })
      .catch((err) => {
        console.error('结算商品加载失败', err);
        wx.showToast({ title: err.message || '商品加载失败', icon: 'none' });
      });
  },

  loadAddresses() {
    fetchAddressList(getUid())
      .then((res) => {
        const list = res.list || [];
        let selected = list.find((a) => a.isDefault) || list[0] || null;
        // 若用户之前选过,优先沿用
        const prev = wx.getStorageSync('mushenmu_selected_address');
        if (prev) {
          const hit = list.find((a) => String(a.id) === String(prev));
          if (hit) selected = hit;
        }
        this.setData({ addressList: list, address: selected });
      })
      .catch((err) => console.error('地址加载失败', err));
  },

  chooseAddress() {
    const { addressList } = this.data;
    if (!addressList.length) {
      wx.navigateTo({ url: '/pages/address/edit' });
      return;
    }
    // 简单选择:弹出 actionSheet(最多 6 项,演示足够)
    const items = addressList.map((a) => `${a.name} ${a.phone} ${a.fullAddress}`);
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const selected = addressList[res.tapIndex];
        wx.setStorageSync('mushenmu_selected_address', selected.id);
        this.setData({ address: selected });
      },
    });
  },

  goAddressList() {
    wx.navigateTo({ url: '/pages/address/list?select=1' });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  onMinus(e) {
    const { index } = e.currentTarget.dataset;
    const items = this.data.items.slice();
    const it = items[index];
    if (it.quantity <= 1) return;
    it.quantity -= 1;
    items[index] = it;
    this.recalc(items);
  },

  onPlus(e) {
    const { index } = e.currentTarget.dataset;
    const items = this.data.items.slice();
    const it = items[index];
    if (it.quantity >= it.stock) {
      wx.showToast({ title: '已达库存上限', icon: 'none' });
      return;
    }
    it.quantity += 1;
    items[index] = it;
    this.recalc(items);
  },

  recalc(items) {
    let totalAmount = 0;
    items.forEach((g) => { totalAmount += g.price * g.quantity; });
    this.setData({ items, totalAmount });
  },

  submit() {
    if (this.data.submitting) return;
    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }
    if (!this.data.items.length) {
      wx.showToast({ title: '没有可结算的商品', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const payload = {
      uid: getUid(),
      addressId: this.data.address.id,
      remark: this.data.remark,
      items: this.data.items.map((g) => ({ productId: g.productId, quantity: g.quantity })),
    };
    commitOrder(payload)
      .then((res) => {
        wx.showToast({ title: '下单成功', icon: 'success' });
        wx.redirectTo({ url: `/pages/order/detail?orderNo=${res.orderNo}` });
      })
      .catch((err) => {
        this.setData({ submitting: false });
        wx.showToast({ title: err.message || '下单失败', icon: 'none' });
      });
  },
});
