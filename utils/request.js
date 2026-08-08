/**
 * 统一请求封装,对接 mushenmu-mall-server(Django 后端)。
 *
 * 后端返回结构统一为:{ data, code, msg, success }
 * 这里统一解包一层,把 data 透传给业务层;HTTP 非 2xx 时
 * 读取 msg 作为错误信息抛出。
 *
 * 全项目统一使用 CommonJS(module.exports / require)。
 */
const { apiBaseUrl } = require('../config');

const DEFAULT_TIMEOUT = 8000;

function buildUrl(path, query) {
  let url = `${apiBaseUrl}${path}`;
  const keys = Object.keys(query || {}).filter(
    (k) => query[k] !== undefined && query[k] !== null && query[k] !== ''
  );
  if (keys.length) {
    const q = keys
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
      .join('&');
    url += (url.indexOf('?') === -1 ? '?' : '&') + q;
  }
  return url;
}

/**
 * @param {string} path  形如 '/api/goods/list'
 * @param {object} options { method, data, query }
 */
function request(path, options) {
  options = options || {};
  const method = options.method || 'GET';
  const data = options.data || {};
  const query = options.query || {};

  const finalUrl = buildUrl(path, query);

  return new Promise((resolve, reject) => {
    const task = wx.request({
      url: finalUrl,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data || {};
          const payload = body.data !== undefined ? body.data : body; // 解包一层
          resolve(payload);
        } else {
          const body = res.data || {};
          reject(new Error(body.msg || `请求失败 ${res.statusCode}: ${path}`));
        }
      },
      fail: (err) => reject(err),
    });

    if (task && typeof task.abort === 'function') {
      const timer = setTimeout(() => {
        try { task.abort(); } catch (e) { /* noop */ }
      }, DEFAULT_TIMEOUT);
      if (task && typeof task.onHeadersReceived === 'function') {
        task.onHeadersReceived(() => clearTimeout(timer));
      }
    }
  });
}

function get(path, query) {
  return request(path, { method: 'GET', query });
}

function post(path, data) {
  return request(path, { method: 'POST', data });
}

module.exports = { get, post, apiBaseUrl, request };
