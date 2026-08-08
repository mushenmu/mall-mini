/**
 * 全局配置。
 *
 * apiBaseUrl: mushenmu-mall-server(Django 后端)地址。
 *  - 开发者工具(后端在本机跑):http://127.0.0.1:8000
 *    并在微信开发者工具勾选「不校验合法域名」。
 *  - 真机预览/局域网调试:改成运行后端那台电脑的内网 IP
 *    (ipconfig 查看 IPv4 地址,手机与电脑需同一 WiFi)。
 *  - 体验版/生产:改成你的服务器公网域名(需在微信公众平台
 *    配置 request 合法域名)。
 */
module.exports = {
  apiBaseUrl: 'http://127.0.0.1:8000',
};
