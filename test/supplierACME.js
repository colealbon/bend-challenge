'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');

let jsonServer = require('json-server')
let server = jsonServer.create()
let router = jsonServer.router('apiacmeauto.json')
let middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)
server.listen(3051, function () {
  console.log('ACME JSON Server is running on 3051')
})

suite('place supplier orders ACME', function() {
    test('check post response ok', function() {
        // fetch('http://127.0.0.1:3000/order', {
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     method: "POST",
        //     body: `{
        //     	"make": "Ford",
        //     	"model": "mustang II",
        //     	"package": "Ghia - yellow with white leather interior",
        //     	"customer": {
        //             "id": "1976",
        //             "shipto": "nebraska"
        //         }}`
        //     })
        // .then(function(res) {
        //     assert.equal(res.ok, true);
        //     return res.text()
        // })
        // .then(function(body) {
        //     const cheers = cheerio.load(body)
        //     const cheersObj = JSON.parse(cheers.text())
        //     assert.equal(cheersObj.status, 'success');
        //     return
        // })
    });
})
