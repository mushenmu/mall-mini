const { fetchUserCenter } = require('../../services/user');
const auth = require('../../utils/auth');

Page({
  data: {
    userInfo: null,
    orderCounts: [],
    isDemo: true,
    loading: true,
    loggingIn: false,
    error: '',
  },

  onShow() {
    this.ensureAndLoad();
  },

  ensureAndLoad() {
    const cached = auth.getUserInfo();
    this.setData({
      userInfo: cached,
      isDemo: !cached || !cached.nickName || cached.nickName === '微信用户',
      loading: true,
      error: '',
    });
    auth.ensureLogin()
      .then(() => fetchUserCenter(auth.getUid()))
      .then((res) => {
        const userInfo = res.userInfo || cached;
        this.setData({
          userInfo,
          orderCounts: res.orderCounts || [],
          isDemo: !userInfo || !userInfo.nickName || userInfo.nickName === '微信用户',
          loading: false,
        });
      })
      .catch((err) => {
        console.error('用户中心加载失败', err);
        this.setData({ loading: false, error: err.message || '登录或加载失败' });
      });
  },

  // 获取微信用户资料(头像昵称填写能力)
  onLogin() {
    if (this.data.loggingIn) return;
    this.setData({ loggingIn: true, error: '' });
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const profile = {
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
        };
        auth.loginWithProfile(profile)
          .then((loginRes) => {
            this.setData({ userInfo: loginRes.userInfo, isDemo: false, loggingIn: false });
            wx.showToast({ title: '登录成功', icon: 'success' });
            return this.load();
          })
          .catch((err) => {
            this.setData({ loggingIn: false, error: err.message || '登录失败' });
            wx.showToast({ title: err.message || '登录失败', icon: 'none' });
          });
      },
      fail: () => this.setData({ loggingIn: false, error: '需要授权微信资料后才能登录' }),
    });
  },

  load() {
    return fetchUserCenter(auth.getUid()).then((res) => {
      const userInfo = res.userInfo || auth.getUserInfo();
      this.setData({ userInfo, orderCounts: res.orderCounts || [], isDemo: !userInfo || userInfo.nickName === '微信用户', loading: false });
    });
  },

  logout() {
    wx.showModal({ title: '退出登录', content: '退出后将清除本机登录信息，确定退出吗？', success: (res) => {
      if (!res.confirm) return;
      auth.clearLogin();
      this.setData({ userInfo: null, orderCounts: [], isDemo: true, error: '' });
      wx.showToast({ title: '已退出登录', icon: 'success' });
    } });
  },

  retry() {
    this.ensureAndLoad();
  },

  goOrders(e) {
    const { status } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/order/list?status=${status}` });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/list' });
  },
});
