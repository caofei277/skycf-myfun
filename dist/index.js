"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myMathAdd = exports.myCurrencyToCapital = exports.myMd5 = exports.mySha1 = exports.hideUniTitleView = exports.isBrowser = exports.isApp = exports.isWeixinBrowser = exports.isMpWeixin = exports.isAndroid = exports.isIos = exports.isQQ = exports.isWeiBo = exports.isWechat = exports.myUtf8Encode = exports.handleParamsEmpty = exports.myRequest = exports.myGetSign = exports.myJsonSort = exports.myCopyObj = exports.getStrLength = exports.myDelStorage = exports.myGetStorage = exports.mySetStorage = void 0;
var axios_1 = require("axios");
var CryptoJS = require("crypto-js");
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
    params = handleParamsEmpty(myCopyObj(params));
    params = myJsonSort(params);
    var signStr = '';
    for (var key in params) {
        if (key !== 'file' && key !== 'mySign' && key !== 'mywd' && key !== 'token') {
            signStr += encodeURIComponent(params[key]);
        }
    }
    // const signTmp = mySha1(signStr);
    var signTmp = myMd5(signStr);
    var token = '';
    try {
        token = params.token;
    }
    catch (e) {
        token = '';
    }
    if (typeof params.mywd !== 'undefined' && params.mywd !== '') {
        console.log('首次拼接', signStr);
        console.log('首次加密', signTmp);
        console.log('token', token);
        console.log('二次拼接', signTmp + token);
        // console.log('二次加密', mySha1(signTmp + token))
        console.log('二次加密', myMd5(signTmp + token));
    }
    // return mySha1(signTmp + token);
    return myMd5(signTmp + token);
}
exports.myGetSign = myGetSign;
/**
 * 公共axios请求方法
 * @param url 请求路由
 * @param params 请求参数
 * @param method 请求方法
 * @param reqType 请求类型 1 普通请求  2 formData(上传文件)
 */
function myRequest(url, params, method, reqType) {
    if (params === void 0) { params = { token_id: 0, mySign: '', token: '' }; }
    if (method === void 0) { method = 'post'; }
    if (reqType === void 0) { reqType = 1; }
    // 发送请求
    return new Promise(function (resolve, reject) {
        var promise;
        if (!(typeof (params.mySign) === 'undefined' || params.mySign === null)) {
            params.mySign = myGetSign(params);
            // @ts-ignore
            params.token = '';
        }
        var headers;
        if (reqType === 1) {
            headers = {
                'Content-Type': 'application/json;charset=UTF-8'
            };
        }
        else if (reqType === 2) {
            headers = {
                // 表示上传的是文件,而不是普通的表单数据
                'Content-Type': 'multipart/form-data'
            };
            // 构建FormData对象,通过该对象存储要上传的文件
            var formData = new FormData();
            // 遍历当前临时文件List,将上传文件添加到FormData对象中
            for (var key in params) {
                formData.append(key, params[key]);
            }
            params = formData;
        }
        // 调用后端接口,发送请求
        promise = (0, axios_1.default)({
            method: method,
            url: url,
            data: params,
            headers: headers
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
// 判断是否在微信中打开
function isWechat() {
    var ua = navigator.userAgent.toLowerCase();
    return /micromessenger/i.test(ua);
}
exports.isWechat = isWechat;
// 判断是否在微博中打开
function isWeiBo() {
    var ua = navigator.userAgent.toLowerCase();
    return /WeiBo/i.test(ua);
}
exports.isWeiBo = isWeiBo;
// 判断是否在QQ中打开
function isQQ() {
    var ua = navigator.userAgent.toLowerCase();
    return /QQ/i.test(ua);
}
exports.isQQ = isQQ;
//终端判断：是否是Ios
function isIos() {
    var ua = navigator.userAgent.toLowerCase();
    return /(iphone|ipod|ipad);?/i.test(ua);
}
exports.isIos = isIos;
//终端判断：是否是Android
function isAndroid() {
    var ua = navigator.userAgent.toLowerCase();
    return /android|adr/i.test(ua);
}
exports.isAndroid = isAndroid;
//判断是否在微信小程序中
function isMpWeixin() {
    var ua = navigator.userAgent.toLowerCase();
    var isWeixin = ua.indexOf('micromessenger') !== -1;
    if (isWeixin) {
        if (window.__wxjs_environment === 'miniprogram') {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}
exports.isMpWeixin = isMpWeixin;
//判断是否在微信浏览器中
function isWeixinBrowser() {
    var ua = navigator.userAgent.toLowerCase();
    var isWeixin = ua.indexOf('micromessenger') !== -1;
    if (isWeixin) {
        if (window.__wxjs_environment === 'miniprogram') {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}
exports.isWeixinBrowser = isWeixinBrowser;
//判断是否在APP中运行
function isApp() {
    // const ua = navigator.userAgent.toLowerCase();
    // const isWeixin = ua.indexOf('micromessenger') !== -1;
    // const isInApp = /(^|;\s)app\//.test(ua);
    // if (isWeixin) {
    //   return false;
    // } else {
    //   if (!isInApp) {
    //     return false;
    //   } else {
    //     return true;
    //   }
    // }
    if (typeof navigator === 'undefined') {
        return true;
    }
    else {
        return false;
    }
}
exports.isApp = isApp;
//判断是否在浏览器中运行
function isBrowser() {
    var ua = navigator.userAgent.toLowerCase();
    var isWeixin = ua.indexOf('micromessenger') !== -1;
    var isInApp = /(^|;\s)app\//.test(ua);
    if (isWeixin) {
        return false;
    }
    else {
        if (!isInApp) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.isBrowser = isBrowser;
/**
 * 隐藏uniapp 顶部标题栏
 */
function hideUniTitleView() {
    var pageNav = document.querySelector("uni-page-head");
    if (pageNav) {
        pageNav.style.display = "none";
    }
}
exports.hideUniTitleView = hideUniTitleView;
/************************************************************
 * sha1
 * - based on sha1 from http://phpjs.org/functions/sha1:512 (MIT / GPL v2)
 ************************************************************/
function mySha1(str) {
    var sha1Hash = CryptoJS.SHA1(str).toString();
    return sha1Hash;
}
exports.mySha1 = mySha1;
function myMd5(string) {
    return CryptoJS.MD5(CryptoJS.enc.Utf8.parse(string)).toString();
}
exports.myMd5 = myMd5;
/**
 * 货币大写转换
 * @param money
 */
function myCurrencyToCapital(money) {
    //汉字的数字
    var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
    //基本单位
    var cnIntRadice = new Array('', '拾', '佰', '仟');
    //对应整数部分扩展单位
    var cnIntUnits = new Array('', '万', '亿', '兆');
    //对应小数部分单位
    var cnDecUnits = new Array('角', '分', '毫', '厘');
    //整数金额时后面跟的字符
    var cnInteger = '整';
    //整型完以后的单位
    var cnIntLast = '元';
    //最大处理的数字
    var maxNum = 999999999999999.9999;
    //金额整数部分
    var integerNum;
    //金额小数部分
    var decimalNum;
    //输出的中文金额字符串
    var chineseStr = '';
    //分离金额后用的数组，预定义
    var parts;
    if (money == '') {
        return '';
    }
    money = parseFloat(money);
    if (money >= maxNum) {
        //超出最大处理数字
        return '';
    }
    if (money == 0) {
        chineseStr = cnNums[0] + cnIntLast + cnInteger;
        return chineseStr;
    }
    //转换为字符串
    money = money.toString();
    if (money.indexOf('.') == -1) {
        integerNum = money;
        decimalNum = '';
    }
    else {
        parts = money.split('.');
        integerNum = parts[0];
        decimalNum = parts[1].substr(0, 4);
    }
    //获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
        var zeroCount = 0;
        var IntLen = integerNum.length;
        for (var i = 0; i < IntLen; i++) {
            var n = integerNum.substr(i, 1);
            var p = IntLen - i - 1;
            var q = p / 4;
            var m = p % 4;
            if (n == '0') {
                zeroCount++;
            }
            else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                //归零
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            if (m == 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
        chineseStr += cnIntLast;
    }
    //小数部分
    if (decimalNum != '') {
        var decLen = decimalNum.length;
        for (var i = 0; i < decLen; i++) {
            var n = decimalNum.substr(i, 1);
            if (n != '0') {
                chineseStr += cnNums[Number(n)] + cnDecUnits[i];
            }
        }
    }
    if (chineseStr == '') {
        chineseStr += cnNums[0] + cnIntLast + cnInteger;
    }
    else if (decimalNum == '') {
        chineseStr += cnInteger;
    }
    return chineseStr;
}
exports.myCurrencyToCapital = myCurrencyToCapital;
/**
 * 精确加法
 * @param num1
 * @param num2
 */
function myMathAdd(num1, num2) {
    var num1Digits = (num1.toString().split(".")[1] || "").length;
    var num2Digits = (num2.toString().split(".")[1] || "").length;
    var baseNum = Math.pow(20, Math.max(num1Digits, num2Digits));
    return (num1 * baseNum + num2 * baseNum) / baseNum;
}
exports.myMathAdd = myMathAdd;
