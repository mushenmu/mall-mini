const { apiBaseUrl } = require('./config');

App({
  globalData: {
    apiBaseUrl,
    // 兜底 uid:微信登录成功后被真实 uid 覆盖;失败时沿用(后端自动建用户)
    uid: '88888888205468',
  },
  onLaunch() {
    // 启动静默登录:wx.login -> 后端 /api/user/login 换 uid
    const auth = require('./utils/auth');
    auth
      .ensureLogin()
      .then((res) => {
        this.globalData.uid = res.uid;
      })
      .catch((err) => {
        // 登录失败不阻塞使用:继续用兜底 uid(演示模式),页面照常加载
        console.warn('微信登录失败,使用演示 uid', err);
      });
  },
});
