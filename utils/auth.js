/**
 * 登录态管理(微信登录)。
 *
 * 登录流程:
 *   wx.login() 获取临时 code -> 后端 /api/user/login 换 uid
 *   -> uid / userInfo 缓存到本地 Storage,后续接口统一带 uid。
 *
 * 与后端约定:所有需要用户身份的接口都通过 uid 参数定位用户
 * (见 mushenmu-mall-server wxcloudrun/views.py)。
 */
const UID_KEY = 'mushenmu_uid';
const INFO_KEY = 'mushenmu_user_info';

// 演示兜底 uid:后端 get_or_create 会自动建用户。
// 仅在微信登录失败时使用,保证 App 不阻塞、页面照常加载。
const FALLBACK_UID = '88888888205468';
let loginPromise = null;

/** 获取当前 uid:优先 Storage(登录结果),其次全局变量,最后兜底。 */
function getUid() {
  const cached = wx.getStorageSync(UID_KEY);
  if (cached) return cached;
  const app = getApp();
  return (app && app.globalData && app.globalData.uid) || FALLBACK_UID;
}

/** 获取缓存的用户资料(可能为 null)。 */
function getUserInfo() {
  return wx.getStorageSync(INFO_KEY) || null;
}

/** 登录成功后保存登录态(uid + 用户资料)。 */
function saveLogin(data) {
  const uid = data && data.uid;
  if (!uid) return;
  wx.setStorageSync(UID_KEY, uid);
  if (data.userInfo) wx.setStorageSync(INFO_KEY, data.userInfo);
  const app = getApp();
  if (app && app.globalData) app.globalData.uid = uid;
  require('./request').invalidateCache('/api/user/center');
  loginPromise = null;
}

/** 退出登录(清空本地登录态,并重置内存态回到兜底 uid)。 */
function clearLogin() {
  wx.removeStorageSync(UID_KEY);
  wx.removeStorageSync(INFO_KEY);
  const app = getApp();
  if (app && app.globalData) app.globalData.uid = FALLBACK_UID;
  loginPromise = null;
}

/**
 * 确保已登录:本地已有 uid 直接返回;否则静默走
 * wx.login -> 后端换 uid -> 保存登录态。
 * @param {object} [profile] 可选 { nickName, avatarUrl }
 * @returns {Promise<{uid: string, isNewUser: boolean, userInfo: object}>}
 */
function ensureLogin(profile) {
  const cached = wx.getStorageSync(UID_KEY);
  if (cached) {
    return Promise.resolve({ uid: cached, userInfo: getUserInfo() });
  }
  if (loginPromise) return loginPromise;
  const { loginWithWeChat } = require('../services/user');
  loginPromise = loginWithWeChat(profile).then((res) => {
    saveLogin(res);
    return res;
  }).catch((error) => {
    loginPromise = null;
    throw error;
  });
  return loginPromise;
}

function loginWithProfile(profile) {
  const { loginWithWeChat } = require('../services/user');
  if (loginPromise) return loginPromise;
  loginPromise = loginWithWeChat(profile).then((res) => {
    saveLogin(res);
    return res;
  }).catch((error) => {
    loginPromise = null;
    throw error;
  });
  return loginPromise;
}

module.exports = {
  getUid, getUserInfo, saveLogin, clearLogin, ensureLogin, loginWithProfile, FALLBACK_UID,
};
