"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports.myRequest = exports.myDelStorage = exports.myGetStorage = exports.mySetStorage = void 0;
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
    return true;
}
exports.myDelStorage = myDelStorage;
/**
 * 公共axios请求方法
 * @param url  请求路由
 * @param params  请求参数
 * @param reqType 请求方法
 */
function myRequest(url, params, reqType) {
    if (params === void 0) { params = {}; }
    if (reqType === void 0) { reqType = 'post'; }
    // 发送请求
    // return new Promise((resolve, reject) => {
    //
    //   let promise;
    //
    //   promise = axios({
    //     method: reqType,
    //     url: url,
    //     data: params
    //   });
    //
    //   promise.then((response: { data: any; }) => {
    //     //成功的回调函数
    //     resolve(response.data)
    //   }).catch((error: any) => {
    //     //失败的回调函数
    //     reject(error)
    //   })
    // })
    // axios({
    //   method: 'post',
    //   url: '/user/12345',
    //   data: {
    //     firstName: 'Fred',
    //     lastName: 'Flintstone'
    //   }
    // });
    console.log('这是request方法');
}
exports.myRequest = myRequest;
/**
 * test
 */
function test() {
    console.log('这是测试方法');
    return true;
}
exports.test = test;
