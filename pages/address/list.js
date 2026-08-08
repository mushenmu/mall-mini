const { fetchAddressList, deleteAddress } = require('../../services/address');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    list: [],
    loading: true,
    selectMode: false,   // 是否从结算页进入(点击返回选中地址)
  },

  onLoad(options) {
    if (options.select) {
      this.setData({ selectMode: true });
      wx.setNavigationBarTitle({ title: '选择收货地址' });
    }
  },

  onShow() {
    this.load();
  },

  load() {
    fetchAddressList(getUid())
      .then((res) => {
        this.setData({ list: res.list || [], loading: false });
      })
      .catch((err) => {
        console.error('地址加载失败', err);
        this.setData({ loading: false });
      });
  },

  choose(e) {
    if (!this.data.selectMode) return;
    const { id } = e.currentTarget.dataset;
    wx.setStorageSync('mushenmu_selected_address', id);
    wx.navigateBack();
  },

  goEdit() {
    wx.navigateTo({ url: '/pages/address/edit' });
  },

  edit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/address/edit?id=${id}` });
  },

  remove(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定删除该地址吗?',
      success: (res) => {
        if (!res.confirm) return;
        deleteAddress(getUid(), id)
          .then(() => {
            const list = this.data.list.filter((a) => String(a.id) !== String(id));
            this.setData({ list });
          })
          .catch((err) => wx.showToast({ title: err.message || '删除失败', icon: 'none' }));
      },
    });
  },

  addAddress() {
    wx.navigateTo({ url: '/pages/address/edit' });
  },
});
