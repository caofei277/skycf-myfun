/**
 * localstorage 存储方法(可设置有效期)
 * @param key key 键
 * @param value value 值，
 * @param expired expired 过期时间，以秒为单位，非必须
 * @param isFullExpired  isFullExpired 过期时间是否为完整过期时间 如果不是 则需要以当前时间加过期时间  如果是完整时间 则说明是完整到期时间戳 则直接使用即可
 */
export declare function mySetStorage(key: string, value: string, expired?: number, isFullExpired?: boolean): string;
export declare function myGetStorage(key: string): any;
/**
 * localstorage 删除
 * @param key
 */
export declare function myDelStorage(key: string): boolean;
/**
 * 获得字符串实际长度，中文2，英文1
 * @param str 要获得长度的字符串
 */
export declare function getStrLength(str: string): number;
/**
 * 拷贝对象
 * @param obj
 */
export declare function myCopyObj(obj: any): any;
/**
 * json对象排序
 * @param json
 */
export declare function myJsonSort(json: any): {};
/**
 * 获取签名
 * @param params
 * @param token
 */
export declare function myGetSign(params?: any): string;
/**
 * 公共axios请求方法
 * @param url  请求路由
 * @param params  请求参数
 * @param reqType 请求方法
 */
export declare function myRequest(url: any, params?: {
    mySign: string;
}, reqType?: string): any;
export declare function myUtf8Encode(argString: any): string;
/************************************************************
 * sha1
 * - based on sha1 from http://phpjs.org/functions/sha1:512 (MIT / GPL v2)
 ************************************************************/
export declare function mySha1(str: any): string;
