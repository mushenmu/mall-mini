const { fetchCategoryList, fetchGoodsList, fetchSearchPopular } = require('../../services/goods');
const { invalidateCache } = require('../../utils/request');
const { getUid } = require('../../utils/auth');

Page({
  data: {
    keyword: '',
    popularWords: [],
    categories: [],       // 一级分类(带 children)
    activeCat: '',        // 当前选中的分类 id(空=全部)
    activeSubCat: '',     // 当前选中的二级分类 id(空=跟随一级)
    activeSubList: [],    // 当前一级分类下的子分类
    goods: [],
    pageNum: 1,
    totalCount: 0,
    loading: false,
    finished: false,
    error: '',
    categoryError: '',
    popularError: '',
    sort: '',             // '' | sales | priceAsc | priceDesc
  },

  onLoad(options) {
    this.loadCategories();
    this.loadPopular();
    if (options && options.keyword !== undefined) {
      this.setData({ keyword: options.keyword || '' });
    }
    const app = getApp();
    const pending = app.globalData && app.globalData.pendingCategoryId;
    if (pending) {
      this.setData({ activeCat: String(pending) });
      app.globalData.pendingCategoryId = null;
    }
    this.reload();
  },

  onShow() {
    // 从首页宫格跳转时,可能带待选分类
    const app = getApp();
    const pending = app.globalData && app.globalData.pendingCategoryId;
    if (pending) {
      this.setData({ activeCat: String(pending) });
      app.globalData.pendingCategoryId = null;
      this.reload();
    }
  },

  onPullDownRefresh() {
    invalidateCache('/api/category/list');
    this.reload(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadMore();
  },

  loadCategories() {
    fetchCategoryList()
      .then((cats) => this.setData({
        categories: (cats || []).map((cat) => Object.assign({}, cat, { id: String(cat.id) })),
        activeSubList: this.resolveSubList(cats || [], this.data.activeCat),
      }))
      .catch((err) => this.setData({ categoryError: err.message || '分类加载失败' }));
  },

  resolveSubList(categories, activeCat) {
    const hit = (categories || []).find((cat) => String(cat.id) === String(activeCat));
    return ((hit && hit.children) || []).map((child) => Object.assign({}, child, { id: String(child.id) }));
  },

  loadPopular() {
    fetchSearchPopular()
      .then((res) => this.setData({ popularWords: res.popularWords || [] }))
      .catch((err) => this.setData({ popularError: err.message || '热门搜索加载失败' }));
  },

  retryAuxiliary() {
    this.setData({ categoryError: '', popularError: '' });
    this.loadCategories();
    this.loadPopular();
  },

  reload(done) {
    this.setData({ pageNum: 1, finished: false });
    this.fetchGoods(1, done);
  },

  fetchGoods(pageNum, done) {
    // 选中子分类时按子分类精确筛选,否则按父分类(含其子分类)
    const categoryId = this.data.activeSubCat || this.data.activeCat;
    this.setData({ loading: true, error: '' });
    fetchGoodsList({
      keyword: this.data.keyword,
      categoryId,
      pageNum,
      pageSize: 10,
      sort: this.data.sort,
    })
      .then((res) => {
        const list = (res.list || []).map((it) => this.formatGoods(it));
        const goods = pageNum === 1 ? list : this.data.goods.concat(list);
        this.setData({
          goods,
          totalCount: res.totalCount || 0,
          pageNum,
          loading: false,
          finished: goods.length >= (res.totalCount || 0),
        });
        if (done) done();
      })
      .catch((err) => {
        console.error('商品列表加载失败', err);
        this.setData({ loading: false, error: err.message || '商品加载失败' });
        if (done) done();
      });
  },

  loadMore() {
    if (this.data.loading || this.data.finished) return;
    this.fetchGoods(this.data.pageNum + 1);
  },

  formatGoods(it) {
    return {
      id: it.id,
      title: it.title,
      image: it.image,
      price: (parseInt(it.price, 10) || 0) / 100,
      sales: it.sales || 0,
      tags: it.tags || [],
    };
  },

  // 搜索框
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.reload();
  },

  onClearKeyword() {
    this.setData({ keyword: '' });
    this.reload();
  },

  onTapPopular(e) {
    this.setData({ keyword: e.currentTarget.dataset.word });
    this.reload();
  },

  // 分类
  onTapCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      activeCat: id === this.data.activeCat ? '' : String(id),
      activeSubCat: '',
      activeSubList: this.resolveSubList(this.data.categories, id),
    });
    this.reload();
  },

  onTapSubCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeSubCat: id === this.data.activeSubCat ? '' : String(id) });
    this.reload();
  },

  // 排序
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({ sort: sort === this.data.sort ? '' : sort });
    this.reload();
  },

  goGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` });
  },

  retry() {
    this.reload();
  },
});
