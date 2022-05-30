"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myRequest = exports.myGetSign = exports.myJsonSort = exports.myCopyObj = exports.getStrLength = exports.myDelStorage = exports.myGetStorage = exports.mySetStorage = void 0;
var axios_1 = require("axios");
// @ts-ignore
var sha1_1 = require("sha1");
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
 * 获得字符串实际长度，中文2，英文1
 * @param str 要获得长度的字符串
 */
function getStrLength(str) {
    var realLength = 0;
    var len = str.length;
    var charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1;
        }
        else {
            realLength += 2;
        }
    }
    return realLength;
}
exports.getStrLength = getStrLength;
;
/**
 * 拷贝对象
 * @param obj
 */
function myCopyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.myCopyObj = myCopyObj;
/**
 * json对象排序
 * @param json
 */
function myJsonSort(json) {
    var arr = [];
    for (var key in json) {
        arr.push(key);
    }
    arr = arr.sort();
    var jsonTmp = {};
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var v = arr_1[_i];
        // @ts-ignore
        jsonTmp[v] = json[v];
    }
    return jsonTmp;
}
exports.myJsonSort = myJsonSort;
/**
 * 获取签名
 * @param params
 * @param token
 */
function myGetSign(params) {
    if (params === void 0) { params = {}; }
    params = myJsonSort(params);
    var signStr = '';
    for (var key in params) {
        if (key !== 'file') {
            signStr += params[key];
        }
    }
    var signTmp = (0, sha1_1.default)(signStr);
    var token = '';
    try {
        token = typeof (myGetStorage('userInfo').token) === 'undefined' || myGetStorage('userInfo').token === null ? '' : myGetStorage('userInfo').token;
    }
    catch (e) {
        token = '';
    }
    return (0, sha1_1.default)(signTmp + token);
}
exports.myGetSign = myGetSign;
/**
 * 公共axios请求方法
 * @param url  请求路由
 * @param params  请求参数
 * @param reqType 请求方法
 */
function myRequest(url, params, reqType) {
    if (params === void 0) { params = { mySign: '' }; }
    if (reqType === void 0) { reqType = 'post'; }
    // 发送请求
    return new Promise(function (resolve, reject) {
        var promise;
        if (!(typeof (params.mySign) === 'undefined' || params.mySign === null)) {
            params.mySign = myGetSign(params);
        }
        promise = (0, axios_1.default)({
            method: reqType,
            url: url,
            data: params
        });
        promise.then(function (response) {
            //成功的回调函数
            resolve(response.data);
        }).catch(function (error) {
            //失败的回调函数
            reject(error);
        });
    });
}
exports.myRequest = myRequest;
