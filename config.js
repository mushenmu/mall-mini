/**
 * 全局配置。
 *
 * apiBaseUrl: mushenmu-mall-server(Django 后端)地址。
 *  - 线上(默认):微信云托管服务域名,小程序正式/体验版使用。
 *  - 本地联调:改成 http://127.0.0.1:8000,并在微信开发者工具
 *    勾选「不校验合法域名」。
 *  - 真机预览/局域网调试:改成运行后端那台电脑的内网 IP
 *    (ipconfig 查看 IPv4 地址,手机与电脑需同一 WiFi)。
 *
 * 注意:小程序正式环境需要在微信公众平台「开发管理-开发设置-
 * 服务器域名」中把 apiBaseUrl 的域名加入 request 合法域名,
 * 且必须为 HTTPS。
 */
module.exports = {
  apiBaseUrl: 'https://django-0px8-293802-7-1465343488.sh.run.tcloudbase.com',
};
