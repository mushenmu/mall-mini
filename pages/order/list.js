const { fetchOrderList } = require('../../services/order');
const { getUid } = require('../../utils/auth');

const TABS = [
  { status: '', label: '全部' },
  { status: 0, label: '待付款' },
  { status: 1, label: '待发货' },
  { status: 2, label: '待收货' },
  { status: 3, label: '已完成' },
];

Page({
  data: {
    tabs: TABS,
    activeTab: '',
    orders: [],
    loading: true,
  },

  onLoad(options) {
    if (options.status !== undefined) {
      this.setData({ activeTab: options.status || '' });
    }
  },

  onShow() {
    this.load();
  },

  onPullDownRefresh() {
    this.load(() => wx.stopPullDownRefresh());
  },

  load(done) {
    fetchOrderList({ uid: getUid(), status: this.data.activeTab })
      .then((res) => {
        const orders = (res.list || []).map((o) => ({
          orderNo: o.orderNo,
          status: o.status,
          statusLabel: o.statusLabel,
          totalAmount: (parseInt(o.paymentAmount, 10) || 0) / 100,
          goodsCount: o.goodsCount,
          firstImage: o.firstImage,
          title: o.title,
          createTime: o.createTime,
        }));
        this.setData({ orders, loading: false });
        if (done) done();
      })
      .catch((err) => {
        console.error('订单列表加载失败', err);
        this.setData({ loading: false });
        if (done) done();
      });
  },

  switchTab(e) {
    const { status } = e.currentTarget.dataset;
    this.setData({ activeTab: status, loading: true });
    this.load();
  },

  goDetail(e) {
    const { no } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/order/detail?orderNo=${no}` });
  },
});
