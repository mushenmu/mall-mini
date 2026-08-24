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
const responseCache = Object.create(null);

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
  const cacheKey = `${method}:${finalUrl}`;
  const cached = responseCache[cacheKey];
  if (method === 'GET' && options.cache && cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let timer = null;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      callback(value);
    };
    let task;
    try {
      task = wx.request({
        url: finalUrl,
        method,
        data,
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const body = res.data || {};
            if (body.success === false) {
              finish(reject, new Error(body.msg || `请求失败: ${path}`));
              return;
            }
            const payload = body.data !== undefined ? body.data : body;
            if (method === 'GET' && options.cache) {
              responseCache[cacheKey] = {
                data: payload,
                expiresAt: Date.now() + (options.ttl || 60000),
              };
            }
            finish(resolve, payload);
          } else {
            const body = res.data || {};
            finish(reject, new Error(body.msg || `请求失败 ${res.statusCode}: ${path}`));
          }
        },
        fail: (err) => finish(reject, err),
      });
    } catch (error) {
      finish(reject, error);
    }
    timer = setTimeout(() => {
      try {
        if (task && typeof task.abort === 'function') task.abort();
      } catch (error) { /* noop */ }
      finish(reject, new Error('请求超时，请检查网络后重试'));
    }, options.timeout || DEFAULT_TIMEOUT);
  });
}

function get(path, query, options) {
  return request(path, Object.assign({}, options, { method: 'GET', query }));
}

function post(path, data) {
  return request(path, { method: 'POST', data });
}

function invalidateCache(path) {
  Object.keys(responseCache).forEach((key) => {
    if (!path || key.indexOf(path) !== -1) delete responseCache[key];
  });
}

module.exports = { get, post, apiBaseUrl, request, invalidateCache };
