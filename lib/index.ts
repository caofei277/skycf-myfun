import axios from "axios";
// @ts-ignore
import qs from "qs";
import * as CryptoJS from 'crypto-js';


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
 * 对象转URLSearchParams
 * @param str
 */
export function fixedEncodeURIComponent (str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
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
    if (key !== 'file' && key !== 'mySign' && key !== 'mywd' && key !== 'token') {
      signStr += fixedEncodeURIComponent(params[key]);
    }
  }


  // const signTmp = mySha1(signStr);
  const signTmp = myMd5(signStr);
  let token = '';
  try{
    token = params.token;
  }catch (e) {
    token = '';
  }

  if(typeof params.mywd !== 'undefined' && params.mywd !== ''){
    console.log('首次拼接', signStr)
    console.log('首次加密', signTmp)
    console.log('token', token)
    console.log('二次拼接', signTmp + token)
    // console.log('二次加密', mySha1(signTmp + token))
    console.log('二次加密', myMd5(signTmp + token));
  }

  // return mySha1(signTmp + token);
  return myMd5(signTmp + token);
}



interface requestData {
  code: number,
  msg: string,
  data: object
}

/**
 * 公共axios请求方法
 * @param url 请求路由
 * @param params 请求参数
 * @param method 请求方法
 * @param reqType 请求类型 1 普通请求  2 formData(上传文件)
 */
export function myRequest(url: any, params: any = {token_id: 0, mySign: '', token: ''}, method = 'post', reqType = 1): Promise<requestData> {
  // 发送请求
  return new Promise<any>((resolve, reject) => {

    let promise: any;

    if(!(typeof(params.mySign) === 'undefined' || params.mySign === null)){
      params.mySign = myGetSign(params);
      // @ts-ignore
      params.token = '';
    }

    let headers: any;

    if(reqType === 1){
      headers = {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }else if(reqType === 2){
      headers = {
        // 表示上传的是文件,而不是普通的表单数据
        'Content-Type': 'multipart/form-data'
      }
      // 构建FormData对象,通过该对象存储要上传的文件
      const formData = new FormData();

      // 遍历当前临时文件List,将上传文件添加到FormData对象中
      for (const key in params) {
        formData.append(key, params[key])
      }
      params = formData
    }

    // 调用后端接口,发送请求
    promise = axios({
      method: method,
      url: url,
      data: params,
      headers: headers
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


// 判断是否在微信中打开
export function isWechat(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/i.test(ua);
}
// 判断是否在微博中打开
export function isWeiBo(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /WeiBo/i.test(ua);
}
// 判断是否在QQ中打开
export function isQQ(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /QQ/i.test(ua);
}

//终端判断：是否是Ios
export function isIos(){
  const ua = navigator.userAgent.toLowerCase();
  return /(iphone|ipod|ipad);?/i.test(ua);
}

//终端判断：是否是Android
export function isAndroid(){
  const ua = navigator.userAgent.toLowerCase();
  return /android|adr/i.test(ua);
}

//判断是否在微信小程序中
export function isMpWeixin(): boolean{
  const ua = navigator.userAgent.toLowerCase();
  const isWeixin = ua.indexOf('micromessenger') !== -1;
  if (isWeixin) {
    if ((window as any).__wxjs_environment === 'miniprogram') {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}


//判断是否在微信浏览器中
export function isWeixinBrowser(): boolean{
  const ua = navigator.userAgent.toLowerCase();
  const isWeixin = ua.indexOf('micromessenger') !== -1;
  if (isWeixin) {
    if ((window as any).__wxjs_environment === 'miniprogram') {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}


//判断是否在APP中运行
export function isApp(){
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
  if(typeof navigator === 'undefined'){
    return true;
  }else{
    return false;
  }
}


//判断是否在浏览器中运行
export function isBrowser(){
  const ua = navigator.userAgent.toLowerCase();
  const isWeixin = ua.indexOf('micromessenger') !== -1;
  const isInApp = /(^|;\s)app\//.test(ua);
  if (isWeixin) {
    return false;
  } else {
    if (!isInApp) {
      return true;
    } else {
      return false;
    }
  }
}

/**
 * 隐藏uniapp 顶部标题栏
 */
export function hideUniTitleView(){
  let pageNav = <HTMLElement>document.querySelector("uni-page-head");
  if (pageNav) {
    pageNav.style.display = "none";
  }
}


/************************************************************
 * sha1
 * - based on sha1 from http://phpjs.org/functions/sha1:512 (MIT / GPL v2)
 ************************************************************/

export function mySha1(str: any) {
  const sha1Hash: string = CryptoJS.SHA1(str).toString();
  return sha1Hash
}



export function myMd5(string: any) {
  return CryptoJS.MD5(CryptoJS.enc.Utf8.parse(string)).toString();
}


/**
 * 货币大写转换
 * @param money
 */
export function myCurrencyToCapital(money: any) {
  //汉字的数字
  let cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
  //基本单位
  let cnIntRadice = new Array('', '拾', '佰', '仟');
  //对应整数部分扩展单位
  let cnIntUnits = new Array('', '万', '亿', '兆');
  //对应小数部分单位
  let cnDecUnits = new Array('角', '分', '毫', '厘');
  //整数金额时后面跟的字符
  let cnInteger = '整';
  //整型完以后的单位
  let cnIntLast = '元';
  //最大处理的数字
  let maxNum = 999999999999999.9999;
  //金额整数部分
  let integerNum;
  //金额小数部分
  let decimalNum;
  //输出的中文金额字符串
  let chineseStr = '';
  //分离金额后用的数组，预定义
  let parts;
  if (money == '') { return ''; }
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
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  //获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    let IntLen = integerNum.length;
    for (let i = 0; i < IntLen; i++) {
      let n = integerNum.substr(i, 1);
      let p = IntLen - i - 1;
      let q = p / 4;
      let m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
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
    let decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      let n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
}


/**
 * 精确加法
 * @param num1
 * @param num2
 */
export function myMathAdd(num1: number, num2: number) {
  const num1Digits = (num1.toString().split(".")[1] || "").length;
  const num2Digits = (num2.toString().split(".")[1] || "").length;
  const baseNum = Math.pow(20,Math.max(num1Digits,num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
