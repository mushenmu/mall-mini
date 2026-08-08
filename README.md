# mushenmu-mall-mini(木神木简单商城 · 微信小程序前端)

简单商城小程序,配套后端为同目录下的 [`mushenmu-mall-server`](../mushenmu-mall-server)(Django)。

## 功能

- 首页:轮播图、分类宫格、热门推荐
- 分类/搜索:两级分类筛选、关键词搜索、销量/价格排序、分页加载
- 商品详情:图片轮播、数量选择、加入购物车、立即购买
- 购物车:选中/全选、数量增减、删除、结算
- 确认订单:地址选择、数量修改、备注、提交
- 订单:状态 Tab(全部/待付款/待发货/待收货/已完成)、详情、支付/取消/确认收货
- 我的:微信登录(头像昵称授权)、订单入口、收货地址管理

## 联调步骤

1. 后端先启动(见 mushenmu-mall-server README),确认 `http://127.0.0.1:8000` 可访问
2. 微信开发者工具导入本目录,AppID 用 `wxbbafb335339858eb`(或你自己的测试号)
3. 详情 -> 本地设置 -> 勾选「不校验合法域名、web-view(业务域名)、TLS 版本以及 HTTPS 证书」
4. 编译即可看到首页数据

真机预览时,把 `config.js` 的 `apiBaseUrl` 改成后端所在电脑的内网 IP
(如 `http://192.168.1.100:8000`),手机与电脑需同一 WiFi。

## 目录结构

```
mushenmu-mall-mini/
├── app.js / app.json / app.wxss   小程序入口与全局配置
├── config.js                      后端地址配置(改这里联调)
├── utils/
│   ├── request.js                 统一请求封装(解包 {data, code, msg, success})
│   └── auth.js                    微信登录态管理(uid 缓存)
├── services/                      按业务域封装的 API 调用
│   ├── goods.js / cart.js / order.js / user.js / address.js
└── pages/
    ├── home/      首页
    ├── goods/     商品列表 + 详情
    ├── cart/      购物车
    ├── order/     确认订单 + 订单列表 + 订单详情
    ├── user/      我的
    └── address/   地址列表 + 编辑
```

## 约定

- 全部使用 CommonJS(`require`/`module.exports`)
- 后端价格以「分」存储,前端展示统一除以 100 转「元」
- 用户身份通过 `utils/auth.js` 的 `getUid()` 获取(登录后为真实 uid,失败回退演示 uid)
