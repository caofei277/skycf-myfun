"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mySetStorage = void 0;
/**
 * localstorage 存储方法
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
            localStorage.setItem(key + "__expires__", (Date.now() / 1000 + expired).toString());
        }
        else {
            localStorage.setItem(key + "__expires__", expired.toString());
        }
    }
    else {
        localStorage.removeItem(key + "__expires__");
    }
    return value;
}
exports.mySetStorage = mySetStorage;
