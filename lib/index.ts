import axios from "axios";
import { useMessage } from 'naive-ui'

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
  const message = useMessage();
  message.success('删除成功');
  return true;
}



export function req(url: any, params:object = {openid: '', token_id: ''}, reqType = 'post', alertMsg = true){
  const message = useMessage();
  // 发送请求
  return new Promise((resolve, reject) => {

    let promise;

    promise = axios({
      method: 'post',
      url: url,
      data: params
    });



    promise.then((response: { data: any; }) => {
      //成功的回调函数
      if(response.data.code === 3 || response.data.code === 5){
        // if(process.env.VUE_APP_ENVIRONMENT != 'local' || true ){
        // ElMessage.warning(response.data.msg)
        // router.push('/login/login')
        return;
        // }
      }else if(response.data.code !== 200 && alertMsg){
        // ElMessage.warning(response.data.msg)
        message.warning(response.data.msg);
      }else if(response.data.code === 200 && response.data.msg !== ''){
        // ElMessage.success(response.data.msg)
        message.success(response.data.msg);
      }
      resolve(response.data)
    }).catch((error: any) => {
      //失败的回调函数
      reject(error)
      // if(viteEnv.VITE_NODE_ENV != 'local'){
      //   // console.log('请求失败，去登陆');
      //   // setTimeout(() => {
      //   //可能登录失败 跳转登录地址
      //   // router.push("/" + encodeURIComponent(''));
      //   alert('系统繁忙，请稍后重试');
      //   //失败的回调函数
      //   reject(error)
      // }
    })
  })
}
