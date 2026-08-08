const { get, post } = require('../utils/request');

// 微信登录:wx.login() 的 code 换 uid
function loginWithWeChat(profile) {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (!res.code) {
          reject(new Error('wx.login 未返回 code'));
          return;
        }
        post('/api/user/login', Object.assign({ code: res.code }, profile || {}))
          .then(resolve)
          .catch(reject);
      },
      fail: reject,
    });
  });
}

// 用户中心:用户信息 + 订单状态统计
function fetchUserCenter(uid) {
  return get('/api/user/center', { uid });
}

module.exports = { loginWithWeChat, fetchUserCenter };
