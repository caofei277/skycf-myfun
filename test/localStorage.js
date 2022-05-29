const Storage = require('dom-storage');
global.localStorage = new Storage(null, {strict: true});
window.localStorage = global.localStorage;
