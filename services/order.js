const { get, post, invalidateCache } = require('../utils/request');

function afterOrderMutation(promise) {
  return promise.then((res) => {
    invalidateCache('/api/user/center');
    return res;
  });
}

// 提交订单(下单)
function commitOrder(params) {
  return afterOrderMutation(post('/api/order/commit', params));
}

// 订单列表:{ uid, status? }
function fetchOrderList(params) {
  return get('/api/order/list', params);
}

// 订单详情
function fetchOrderDetail(uid, orderNo) {
  return get('/api/order/detail', { uid, orderNo });
}

// 模拟支付
function payOrder(uid, orderNo) {
  return afterOrderMutation(post('/api/order/pay', { uid, orderNo }));
}

// 取消订单
function cancelOrder(uid, orderNo) {
  return afterOrderMutation(post('/api/order/cancel', { uid, orderNo }));
}

// 确认收货
function confirmOrder(uid, orderNo) {
  return afterOrderMutation(post('/api/order/confirm', { uid, orderNo }));
}

module.exports = {
  commitOrder, fetchOrderList, fetchOrderDetail,
  payOrder, cancelOrder, confirmOrder,
};
