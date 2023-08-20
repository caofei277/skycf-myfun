'use strict';
const expect = require('chai').expect;
const mySetStorage = require('../dist/index').mySetStorage;

describe('@skycf/myfun function test', () => {
  it('should return 1', () => {
    const result = mySetStorage('testkey', 'testval');
    expect(result).toString();
  });
});


