import axios from "axios";




/**
 * localstorage 存储方法(可设置有效期)
 * @param key key 键
 * @param value value 值，
 * @param expired expired 过期时间，以秒为单位，非必须
 * @param isFullExpired  isFullExpired 过期时间是否为完整过期时间 如果不是 则需要以当前时间加过期时间  如果是完整时间 则说明是完整到期时间戳 则直接使用即可
 */


export function mySetStorage(key: string, value: string, expired: number = 0, isFullExpired: boolean = false) {
  localStorage.setItem(key, JSON.stringify(value));
  if (expired) {
    if (!isFullExpired) {
      localStorage.setItem(
        `${key}__expires__`,
        (Date.now() / 1000 + expired).toString()
      );
    } else {
      localStorage.setItem(
        `${key}__expires__`,
        expired.toString()
      );
    }
  } else {
    localStorage.removeItem(`${key}__expires__`);
  }
  return value;
}


/*
   * localstorage 获取方法
   * @ param {String} 	key 键
   * @ param {String} 	expired 存储时为非必须字段，所以有可能取不到，默认为 Date.now+1
   */
export function myGetStorage(key: string) {
  const now = Date.now() / 1000;
  const expired = Number(localStorage.getItem(`${key}__expires__`)) || now + 1;

  if (now >= expired) {
    localStorage.removeItem(key);
    return null;
  } else {
    // console.log('还没有过期' + now + '|' + expired)
  }


  const val = localStorage.getItem(key);

  try {
    return typeof (val) === "string" && val ? JSON.parse(val) : null;
  } catch (e) {
    return val;
  }

}


/**
 * localstorage 删除
 * @param key
 */
export function myDelStorage(key: string) {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}__expires__`);
  return true;
}

/**
 * 获得字符串实际长度，中文2，英文1
 * @param str 要获得长度的字符串
 */
export function getStrLength(str: string) {
  let realLength = 0;
  const len = str.length;
  let charCode = -1;
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    }else {
      realLength += 2;
    }
  }
  return realLength;
};


/**
 * 拷贝对象
 * @param obj
 */
export function myCopyObj(obj: any){
  return JSON.parse(JSON.stringify(obj));
}


/**
 * json对象排序
 * @param json
 */
export function myJsonSort(json: any) {
  let arr = [];
  for (const key in json) {
    arr.push(key);
  }
  arr = arr.sort();

  const jsonTmp = {};

  for (const v of arr) {
    // @ts-ignore
    jsonTmp[v] = json[v];
  }

  return jsonTmp;

}


/**
 * 获取签名
 * @param params
 * @param token
 */
export function myGetSign(params: any = {}) :string{
  params = handleParamsEmpty(myCopyObj(params));
  params = myJsonSort(params);
  let signStr = '';
  for (const key in params) {
    if (key !== 'file' && key !== 'mySign' && key !== 'mywd') {
      signStr += params[key];
    }
  }


  const signTmp = mySha1(signStr);
  let token = '';
  try{
    token = typeof(myGetStorage('userInfo').token) === 'undefined' || myGetStorage('userInfo').token === null ? '' : myGetStorage('userInfo').token;
  }catch (e) {
    token = '';
  }

  if(typeof params.mywd !== 'undefined' && params.mywd !== ''){
    console.log('首次拼接', signStr)
    console.log('首次加密', signTmp)
    console.log('token', token)
    console.log('二次拼接', signTmp + token)
    console.log('二次加密', mySha1(signTmp + token))
  }

  return mySha1(signTmp + token);
}


/**
 * 公共axios请求方法
 * @param url  请求路由
 * @param params  请求参数
 * @param reqType 请求方法
 */
export function myRequest(url: any, params = {mySign: ''}, reqType = 'post'): any {
  // 发送请求
  return new Promise<any>((resolve, reject) => {

    let promise;

    if(!(typeof(params.mySign) === 'undefined' || params.mySign === null)){
      params.mySign = myGetSign(params);
    }


    promise = axios({
      method: reqType,
      url: url,
      data: params
    });

    promise.then((response: { data: any; }) => {
      //成功的回调函数
      resolve(response.data)
    }).catch((error: any) => {
      //失败的回调函数
      reject(error)
    })
  })
}


/**
 * 设置参数为undefined 或者 null的 时候 值改为 空字符串
 * @param params
 */
export function handleParamsEmpty(params: any){
  let paramsTmp: any = {};
  for (let key in params){
    if(key !== 'file'){
      paramsTmp[key] = typeof(params[key]) === 'undefined' || params[key] === null ? '' :  typeof(params[key]) === 'object' ? JSON.stringify(params[key]) : params[key];
    }else{
      paramsTmp.file = params[key];
    }
  }
  return paramsTmp;
}


/*
    * UTF-8 encoding
    */
export function myUtf8Encode(argString: any) {
  return decodeURIComponent(encodeURIComponent(argString));
}

/************************************************************
 * sha1
 * - based on sha1 from http://phpjs.org/functions/sha1:512 (MIT / GPL v2)
 ************************************************************/

export function mySha1(str: any) {
  // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // + namespaced by: Michael White (http://getsprink.com)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   jslinted by: Anthon Pang (http://edc.org)

  var
    rotate_left = function (n: number, s: number) {
      return (n << s) | (n >>> (32 - s));
    },

    cvt_hex = function (val: number) {
      var strout = '',
        i,
        v;

      for (i = 7; i >= 0; i--) {
        v = (val >>> (i * 4)) & 0x0f;
        strout += v.toString(16);
      }

      return strout;
    },

    blockstart,
    i,
    j,
    W = [],
    H0 = 0x67452301,
    H1 = 0xEFCDAB89,
    H2 = 0x98BADCFE,
    H3 = 0x10325476,
    H4 = 0xC3D2E1F0,
    A,
    B,
    C,
    D,
    E,
    temp,
    str_len,
    word_array = [];

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
