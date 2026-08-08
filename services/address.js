const { get, post } = require('../utils/request');

// 地址列表
function fetchAddressList(uid) {
  return get('/api/address/list', { uid });
}

// 保存地址(有 id 为编辑,无 id 为新增)
function saveAddress(uid, data) {
  return post('/api/address/save', Object.assign({ uid }, data));
}

// 删除地址
function deleteAddress(uid, id) {
  return post('/api/address/delete', { uid, id });
}

module.exports = { fetchAddressList, saveAddress, deleteAddress };
