'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');

let jsonServer = require('json-server')
let server = jsonServer.create()
let router = jsonServer.router('test/apiacmeauto.json')
let middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)
server.listen(3051, function () {
  console.log('ACME JSON Server is running on 3051')
})

suite('place supplier orders ACME', function() {
    test('check post response ok', function() {
    });
})
