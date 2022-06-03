"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mySha1 = exports.myUtf8Encode = exports.handleParamsEmpty = exports.myRequest = exports.myGetSign = exports.myJsonSort = exports.myCopyObj = exports.getStrLength = exports.myDelStorage = exports.myGetStorage = exports.mySetStorage = void 0;
var axios_1 = require("axios");
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
        if (key !== 'file' && key !== 'mySign') {
            signStr += params[key];
        }
    }
    var signTmp = mySha1(signStr);
    var token = '';
    try {
        token = typeof (myGetStorage('userInfo').token) === 'undefined' || myGetStorage('userInfo').token === null ? '' : myGetStorage('userInfo').token;
    }
    catch (e) {
        token = '';
    }
    return mySha1(signTmp + token);
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
/**
 * 设置参数为undefined 或者 null的 时候 值改为 空字符串
 * @param params
 */
function handleParamsEmpty(params) {
    var paramsTmp = {};
    for (var key in params) {
        if (key !== 'file') {
            paramsTmp[key] = typeof (params[key]) === 'undefined' || params[key] === null ? '' : typeof (params[key]) === 'object' ? JSON.stringify(params[key]) : params[key];
        }
        else {
            paramsTmp.file = params[key];
        }
    }
    return paramsTmp;
}
exports.handleParamsEmpty = handleParamsEmpty;
/*
    * UTF-8 encoding
    */
function myUtf8Encode(argString) {
    return decodeURIComponent(encodeURIComponent(argString));
}
exports.myUtf8Encode = myUtf8Encode;
/************************************************************
 * sha1
 * - based on sha1 from http://phpjs.org/functions/sha1:512 (MIT / GPL v2)
 ************************************************************/
function mySha1(str) {
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   jslinted by: Anthon Pang (http://edc.org)
    var rotate_left = function (n, s) {
        return (n << s) | (n >>> (32 - s));
    }, cvt_hex = function (val) {
        var strout = '', i, v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            strout += v.toString(16);
        }
        return strout;
    }, blockstart, i, j, W = [], H0 = 0x67452301, H1 = 0xEFCDAB89, H2 = 0x98BADCFE, H3 = 0x10325476, H4 = 0xC3D2E1F0, A, B, C, D, E, temp, str_len, word_array = [];
    str = myUtf8Encode(str);
    str_len = str.length;
    for (i = 0; i < str_len - 3; i += 4) {
        j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 |
            str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
        word_array.push(j);
    }
    switch (str_len & 3) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
            break;
    }
    word_array.push(i);
    while ((word_array.length & 15) !== 14) {
        word_array.push(0);
    }
    word_array.push(str_len >>> 29);
    word_array.push((str_len << 3) & 0x0ffffffff);
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) {
            W[i] = word_array[blockstart + i];
        }
        for (i = 16; i <= 79; i++) {
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }
    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    return temp.toLowerCase();
}
exports.mySha1 = mySha1;
