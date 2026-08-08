const { fetchAddressList, saveAddress } = require('../../services/address');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    id: null,          // 有值=编辑,无值=新增
    form: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
    },
    saving: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      // 载入已有数据
      fetchAddressList(getUid())
        .then((res) => {
          const hit = (res.list || []).find((a) => String(a.id) === String(options.id));
          if (hit) {
            this.setData({
              form: {
                name: hit.name,
                phone: hit.phone,
                province: hit.province,
                city: hit.city,
                district: hit.district,
                detail: hit.detail,
                isDefault: !!hit.isDefault,
              },
            });
          }
        })
        .catch(() => {});
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onToggleDefault(e) {
    this.setData({ 'form.isDefault': e.detail.value });
  },

  save() {
    const f = this.data.form;
    if (!f.name.trim()) return wx.showToast({ title: '请填写收货人', icon: 'none' });
    if (!/^1\d{10}$/.test(f.phone.trim())) return wx.showToast({ title: '请填写正确的手机号', icon: 'none' });
    if (!f.detail.trim()) return wx.showToast({ title: '请填写详细地址', icon: 'none' });
    if (this.data.saving) return;

    this.setData({ saving: true });
    const payload = Object.assign({}, f, {
      name: f.name.trim(),
      phone: f.phone.trim(),
      detail: f.detail.trim(),
    });
    if (this.data.id) payload.id = this.data.id;

    saveAddress(getUid(), payload)
      .then(() => {
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 600);
      })
      .catch((err) => {
        this.setData({ saving: false });
        wx.showToast({ title: err.message || '保存失败', icon: 'none' });
      });
  },
});
