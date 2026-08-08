const { fetchOrderDetail, payOrder, cancelOrder, confirmOrder } = require('../../services/order');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    orderNo: null,
    order: null,
    loading: true,
    operating: false,
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo });
    this.load();
  },

  load() {
    fetchOrderDetail(this.data.orderNo)
      .then((o) => {
        o.totalAmountYuan = (parseInt(o.totalAmount, 10) || 0) / 100;
        o.paymentAmountYuan = (parseInt(o.paymentAmount, 10) || 0) / 100;
        o.items = (o.items || []).map((i) => Object.assign({}, i, {
          priceYuan: (parseInt(i.price, 10) || 0) / 100,
        }));
        this.setData({ order: o, loading: false });
      })
      .catch((err) => {
        console.error('订单详情加载失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: err.message || '订单不存在', icon: 'none' });
      });
  },

  pay() {
    if (this.data.operating) return;
    this.setData({ operating: true });
    payOrder(getUid(), this.data.orderNo)
      .then(() => {
        wx.showToast({ title: '支付成功', icon: 'success' });
        this.setData({ operating: false });
        this.load();
      })
      .catch((err) => {
        this.setData({ operating: false });
        wx.showToast({ title: err.message || '支付失败', icon: 'none' });
      });
  },

  cancel() {
    if (this.data.operating) return;
    wx.showModal({
      title: '提示',
      content: '确定取消该订单吗?',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ operating: true });
        cancelOrder(getUid(), this.data.orderNo)
          .then(() => {
            wx.showToast({ title: '已取消', icon: 'success' });
            this.setData({ operating: false });
            this.load();
          })
          .catch((err) => {
            this.setData({ operating: false });
            wx.showToast({ title: err.message || '取消失败', icon: 'none' });
          });
      },
    });
  },

  confirm() {
    if (this.data.operating) return;
    this.setData({ operating: true });
    confirmOrder(getUid(), this.data.orderNo)
      .then(() => {
        wx.showToast({ title: '已确认收货', icon: 'success' });
        this.setData({ operating: false });
        this.load();
      })
      .catch((err) => {
        this.setData({ operating: false });
        wx.showToast({ title: err.message || '操作失败', icon: 'none' });
      });
  },

  goOrderList() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/order/list' }),
    });
  },
});
