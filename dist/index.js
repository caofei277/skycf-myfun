"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.req = exports.myDelStorage = exports.myGetStorage = exports.mySetStorage = void 0;
var axios_1 = require("axios");
var naive_ui_1 = require("naive-ui");
/**
 * localstorage 存储方法(可设置有效期)
 * @param key key 键
 * @param value value 值，
 * @param expired expired 过期时间，以秒为单位，非必须
 * @param isFullExpired  isFullExpired 过期时间是否为完整过期时间 如果不是 则需要以当前时间加过期时间  如果是完整时间 则说明是完整到期时间戳 则直接使用即可
 */
function mySetStorage(key, value, expired, isFullExpired) {
    if (expired === void 0) { expired = 0; }
    if (isFullExpired === void 0) { isFullExpired = false; }
    localStorage.setItem(key, JSON.stringify(value));
    if (expired) {
        if (!isFullExpired) {
            localStorage.setItem("".concat(key, "__expires__"), (Date.now() / 1000 + expired).toString());
        }
        else {
            localStorage.setItem("".concat(key, "__expires__"), expired.toString());
        }
    }
    else {
        localStorage.removeItem("".concat(key, "__expires__"));
    }
    return value;
}
exports.mySetStorage = mySetStorage;
/*
   * localstorage 获取方法
   * @ param {String} 	key 键
   * @ param {String} 	expired 存储时为非必须字段，所以有可能取不到，默认为 Date.now+1
   */
function myGetStorage(key) {
    var now = Date.now() / 1000;
    var expired = Number(localStorage.getItem("".concat(key, "__expires__"))) || now + 1;
    if (now >= expired) {
        localStorage.removeItem(key);
        return null;
    }
    else {
        // console.log('还没有过期' + now + '|' + expired)
    }
    var val = localStorage.getItem(key);
    try {
        return typeof (val) === "string" && val ? JSON.parse(val) : null;
    }
    catch (e) {
        return val;
    }
}
exports.myGetStorage = myGetStorage;
/**
 * localstorage 删除
 * @param key
 */
function myDelStorage(key) {
    localStorage.removeItem(key);
    localStorage.removeItem("".concat(key, "__expires__"));
    var message = (0, naive_ui_1.useMessage)();
    message.success('删除成功');
    return true;
}
exports.myDelStorage = myDelStorage;
function req(url, params, reqType, alertMsg) {
    if (params === void 0) { params = { openid: '', token_id: '' }; }
    if (reqType === void 0) { reqType = 'post'; }
    if (alertMsg === void 0) { alertMsg = true; }
    var message = (0, naive_ui_1.useMessage)();
    // 发送请求
    return new Promise(function (resolve, reject) {
        var promise;
        promise = (0, axios_1.default)({
            method: 'post',
            url: url,
            data: params
        });
        promise.then(function (response) {
            //成功的回调函数
            if (response.data.code === 3 || response.data.code === 5) {
                // if(process.env.VUE_APP_ENVIRONMENT != 'local' || true ){
                // ElMessage.warning(response.data.msg)
                // router.push('/login/login')
                return;
                // }
            }
            else if (response.data.code !== 200 && alertMsg) {
                // ElMessage.warning(response.data.msg)
                message.warning(response.data.msg);
            }
            else if (response.data.code === 200 && response.data.msg !== '') {
                // ElMessage.success(response.data.msg)
                message.success(response.data.msg);
            }
            resolve(response.data);
        }).catch(function (error) {
            //失败的回调函数
            reject(error);
            // if(viteEnv.VITE_NODE_ENV != 'local'){
            //   // console.log('请求失败，去登陆');
            //   // setTimeout(() => {
            //   //可能登录失败 跳转登录地址
            //   // router.push("/" + encodeURIComponent(''));
            //   alert('系统繁忙，请稍后重试');
            //   //失败的回调函数
            //   reject(error)
            // }
        });
    });
}
exports.req = req;
