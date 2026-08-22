const { fetchUserCenter } = require('../../services/user');
const { getUid, getUserInfo } = require('../../utils/auth');

Page({
  data: {
    userInfo: null,
    orderCounts: [],
    isDemo: true,
  },

  onShow() {
    this.load();
  },

  load() {
    const cached = getUserInfo();
    this.setData({
      userInfo: cached,
      isDemo: !cached || !cached.nickName || cached.nickName === '微信用户',
    });
    fetchUserCenter(getUid())
      .then((res) => {
        const userInfo = res.userInfo || cached;
        this.setData({
          userInfo,
          orderCounts: res.orderCounts || [],
          isDemo: !userInfo || !userInfo.nickName || userInfo.nickName === '微信用户',
        });
      })
      .catch((err) => console.error('用户中心加载失败', err));
  },

  // 获取微信用户资料(头像昵称填写能力)
  onLogin() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const profile = {
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
        };
        const auth = require('../../utils/auth');
        const { loginWithWeChat } = require('../../services/user');
        loginWithWeChat(profile)
          .then((loginRes) => {
            auth.saveLogin(loginRes);
            this.setData({ userInfo: loginRes.userInfo, isDemo: false });
            wx.showToast({ title: '登录成功', icon: 'success' });
          })
          .catch((err) => wx.showToast({ title: err.message || '登录失败', icon: 'none' }));
      },
      fail: () => {},
    });
  },

  goOrders(e) {
    const { status } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/order/list?status=${status}` });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/list' });
  },
});
