'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');

let jsonServer = require('json-server')
let server = jsonServer.create()
let router = jsonServer.router('test/apiranier.json')
let middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)
server.listen(3050, function () {
  console.log('RANIER JSON Server is running on 3050')
})

suite('place supplier orders RANIER', function() {
    test('check post response ok', function() {
    });
})
