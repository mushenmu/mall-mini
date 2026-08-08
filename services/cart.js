const { get, post } = require('../utils/request');

// 购物车列表
function fetchCart(uid) {
  return get('/api/cart', { uid });
}

// 加入购物车
function addToCart(uid, productId, quantity) {
  return post('/api/cart/add', { uid, productId, quantity });
}

// 更新条目(数量 / 选中)
function updateCartItem(uid, id, patch) {
  return post('/api/cart/update', Object.assign({ uid, id }, patch));
}

// 删除条目(ids 数组)
function deleteCartItems(uid, ids) {
  return post('/api/cart/delete', { uid, ids });
}

module.exports = { fetchCart, addToCart, updateCartItem, deleteCartItems };
