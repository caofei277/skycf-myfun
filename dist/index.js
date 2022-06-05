"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myMd5 = exports.mySha1 = exports.myUtf8Encode = exports.handleParamsEmpty = exports.myRequest = exports.myGetSign = exports.myJsonSort = exports.myCopyObj = exports.getStrLength = exports.myDelStorage = exports.myGetStorage = exports.mySetStorage = void 0;
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
    //获取用户信息
    uni.showToast({
        title: '提交成功123',
        duration: 2000
    });
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
        if (key !== 'file' && key !== 'mySign' && key !== 'mywd') {
            signStr += params[key];
        }
    }
    // const signTmp = mySha1(signStr);
    var signTmp = myMd5(signStr);
    var token = '';
    try {
        token = typeof (myGetStorage('userInfo').token) === 'undefined' || myGetStorage('userInfo').token === null ? '' : myGetStorage('userInfo').token;
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
function myRequest(url, params, reqType) {
    if (params === void 0) { params = { token_id: 0, mySign: '' }; }
    if (reqType === void 0) { reqType = 'post'; }
    // 发送请求
    return new Promise(function (resolve, reject) {
        var promise;
        if (!(typeof (params.mySign) === 'undefined' || params.mySign === null)) {
            try {
                params.token_id = typeof (myGetStorage('userInfo').token_id) === 'undefined' || myGetStorage('userInfo').token_id === null ? 0 : myGetStorage('userInfo').token_id;
            }
            catch (e) {
                params.token_id = 0;
            }
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
function myMd5(string) {
    function md5_RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function md5_AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            }
            else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        }
        else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
    function md5_F(x, y, z) {
        return (x & y) | ((~x) & z);
    }
    function md5_G(x, y, z) {
        return (x & z) | (y & (~z));
    }
    function md5_H(x, y, z) {
        return (x ^ y ^ z);
    }
    function md5_I(x, y, z) {
        return (y ^ (x | (~z)));
    }
    function md5_FF(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    }
    ;
    function md5_GG(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    }
    ;
    function md5_HH(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    }
    ;
    function md5_II(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    }
    ;
    function md5_ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }
    ;
    function md5_WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }
    ;
    function md5_Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
    ;
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    string = md5_Utf8Encode(string);
    x = md5_ConvertToWordArray(string);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = md5_FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = md5_GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = md5_HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = md5_II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = md5_AddUnsigned(a, AA);
        b = md5_AddUnsigned(b, BB);
        c = md5_AddUnsigned(c, CC);
        d = md5_AddUnsigned(d, DD);
    }
    return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toLowerCase();
}
exports.myMd5 = myMd5;
