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
    if(!isFullExpired){
      localStorage.setItem(
        `${key}__expires__`,
        (Date.now() / 1000 + expired).toString()
      );
    }else{
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
export function myGetStorage(key: string)  {
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
    return typeof(val) === "string" && val ? JSON.parse(val) : null;
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
 * 公共axios请求方法
 * @param url  请求路由
 * @param params  请求参数
 * @param reqType 请求方法
 */
export function myRequest(url: any, params:object = {}, reqType = 'post') {
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
  console.log('这是request方法')
}

/**
 * test
 */
export function test(){
  console.log('这是测试方法')
  return true;
}
