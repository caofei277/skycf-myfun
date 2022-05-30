import axios from "axios";
// @ts-ignore
import sha1 from "sha1";

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
  params = myJsonSort(params);
  let signStr = '';
  for (const key in params) {
    if (key !== 'file') {
      signStr += params[key];
    }
  }


  const signTmp = sha1(signStr);
  let token = '';
  try{
    token = typeof(myGetStorage('userInfo').token) === 'undefined' || myGetStorage('userInfo').token === null ? '' : myGetStorage('userInfo').token;
  }catch (e) {
    token = '';
  }

  return sha1(signTmp + token);
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






