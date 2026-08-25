const { fetchOrderDetail, fetchOrderLogistics, payOrder, cancelOrder, confirmOrder } = require('../../services/order');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    orderNo: null,
    order: null,
    loading: true,
    operating: false,
    logisticsLoading: false,
    logisticsError: '',
    logistics: null,
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo });
    this.load();
  },

  load() {
    fetchOrderDetail(getUid(), this.data.orderNo)
      .then((o) => {
        o.totalAmountYuan = (parseInt(o.totalAmount, 10) || 0) / 100;
        o.paymentAmountYuan = (parseInt(o.paymentAmount, 10) || 0) / 100;
        o.hasExpress = !!o.expressNo;
        o.items = (o.items || []).map((i) => Object.assign({}, i, {
          priceYuan: (parseInt(i.price, 10) || 0) / 100,
        }));
        this.setData({ order: o, loading: false });
        if (o.hasExpress) this.loadLogistics();
      })
      .catch((err) => {
        console.error('订单详情加载失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: err.message || '订单不存在', icon: 'none' });
      });
  },

  loadLogistics() {
    this.setData({ logisticsLoading: true, logisticsError: '' });
    fetchOrderLogistics(getUid(), this.data.orderNo)
      .then((logistics) => this.setData({ logistics, logisticsLoading: false }))
      .catch((err) => this.setData({ logisticsLoading: false, logisticsError: err.message || '物流加载失败' }));
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
