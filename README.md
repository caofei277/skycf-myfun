# @skycf/myfun

[![Build Status](https://travis-ci.org/youthcity/ts-hi.svg?branch=master)](https://travis-ci.org/@skycf/myfun)
[![Coverage Status](https://coveralls.io/repos/github/youthcity/ts-hi/badge.svg)](https://coveralls.io/github/@skycf/myfun)

## Install

```sh
npm install @skycf/myfun
yarn add @skycf/myfun
```

## Usage

### Typescript
```
import { mySetStorage } from '@skycf/myfun';

console.log(mySetStorage('key', 'val', 7200));
```

### javascript

```
import mySetStorage = require('@skycf/myfun').mySetStorage;

console.log(mySetStorage('key', 'val', 7200));
```

## Test

```sh
npm run test
```
