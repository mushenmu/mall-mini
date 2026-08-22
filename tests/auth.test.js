const assert = require('assert');

const app = { globalData: { uid: 'stale-user' } };
const storage = {};
global.getApp = () => app;
global.wx = {
  getStorageSync(key) { return storage[key]; },
  setStorageSync(key, value) { storage[key] = value; },
  removeStorageSync(key) { delete storage[key]; },
  login({ success }) { setTimeout(() => success({ code: 'dev-code' }), 0); },
  request(options) {
    setTimeout(() => options.success({
      statusCode: 200,
      data: { data: { uid: 'logged-in-user', userInfo: { nickName: '测试用户' } } },
    }), 0);
    return { abort() {} };
  },
};

const auth = require('../utils/auth');

async function run() {
  auth.saveLogin({ uid: 'saved-user', userInfo: { nickName: '保存用户' } });
  assert.strictEqual(auth.getUid(), 'saved-user');
  auth.clearLogin();
  assert.strictEqual(auth.getUid(), auth.FALLBACK_UID);
  assert.strictEqual(app.globalData.uid, auth.FALLBACK_UID);

  const [first, second] = await Promise.all([auth.ensureLogin(), auth.ensureLogin()]);
  assert.strictEqual(first.uid, 'logged-in-user');
  assert.strictEqual(second.uid, 'logged-in-user');
  assert.strictEqual(auth.getUserInfo().nickName, '测试用户');
  console.log('auth flow test passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
