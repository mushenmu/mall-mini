const assert = require('assert');

let networkCalls = 0;
global.wx = {
  request(options) {
    networkCalls += 1;
    setTimeout(() => {
      options.success({
        statusCode: 200,
        data: { data: { call: networkCalls }, success: true },
      });
    }, 0);
    return {
      abort() {},
      onHeadersReceived(callback) { callback(); },
    };
  },
};

const { get, invalidateCache } = require('../utils/request');

async function run() {
  invalidateCache();
  const first = await get('/api/home', {}, { cache: true, ttl: 1000 });
  const second = await get('/api/home', {}, { cache: true, ttl: 1000 });

  assert.deepStrictEqual(second, first);
  assert.strictEqual(networkCalls, 1, '相同 GET 请求应命中缓存，不应重复访问网络');
  console.log('request cache test passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
