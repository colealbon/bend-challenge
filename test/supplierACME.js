'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');

let webserver = require('../app.js');
const http = require('http');
if (!webserver) webserver = http.createServer();

let jsonServer = require('json-server')
let server = jsonServer.create()
let router = jsonServer.router('test/apiacmeauto.json')
let middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)
server.use(function (req, res, next) {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  // Continue to JSON Server router
  next()
})

router.render = function (req, res) {
  res.json({
   body: `{"order": "${Math.floor(Math.random() * 999999)}"}`
  })
}
server.use(router)

server.listen(3051, function () {
  console.log('ACME JSON Server is running on 3051')
})

suite('place supplier orders ACME', function() {
    test('check post response ok', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
                "make": "ACME Autos",
                "model": "roadrunner",
                "package": "elite",
                "customer": {
                    "id": "1976",
                    "shipto": "nebraska"
                }}`
            })
        .then(function(res) {
            assert.equal(res.ok, true);
            return res.text()
        })
        .then(function(body) {
            const cheers = cheerio.load(body)
            const cheersObj = JSON.parse(cheers.text())
            assert.equal(cheersObj.status, 'success');

        })
    });
    test('should error if bad model', function() {
        // model=[anvil,wile,roadrunner]
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
                "make": "ACME Autos",
                "model": "mustang",
                "package": "elite",
                "customer": {
                    "id": "1976",
                    "shipto": "nebraska"
                }}`
            })
        .then(function(res) {
            assert.notEqual(res.ok, true);
            return res.text()
        })
    });
    test('should error if bad package', function() {
        // validate package=[std,super,elite]
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
                "make": "ACME Autos",
                "model": "roadrunner",
                "package": "lemon",
                "customer": {
                    "id": "1976",
                    "shipto": "nebraska"
                }}`
            })
        .then(function(res) {
            assert.notEqual(res.ok, true);
            return res.text()
        })
        .then(function(body) {
            const cheers = cheerio.load(body)
            assert.equal(cheers.text(), 'not a known ACME package');
        })
    });
})
