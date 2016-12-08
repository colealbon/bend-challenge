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
let router = jsonServer.router('test/apiranier.json')
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

server.listen(3050, function () {
  console.log('RANIER JSON Server is running on 3050')
})

//3050
// ● API URL: http://localhost:3051/r ● Token Request:
// ○ You have to get a one­time token from this supplier for submitting an order.
// ■ GET /nonce_token
// ■ Parameters:
// ● storefront=”ccas­bb9630c04f”
// ■ Response Sample:
// ● {nonce_token: “ff6bfd673ab6ae03d8911”}
// ● For implementation, you can just fake a
// token response.
// ● Order Request
// ○ Endpoint: POST /request_customized_model ○ Parameters
//
//     ■ token=”ff6bfd673ab6ae03d8911” ■ model=[pugetsound,olympic]
// ■ custom=[mtn,ltd,14k]
// ○ Response (as JSON)
// ■ Sample: {order_id: “206”}
// ■ For implementation, can generate a random number for the order_id.

suite('place supplier orders RANIER', function() {
    test('check post response ok', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
                "make": "Ranier",
                "model": "pugetsound",
                "package": "mtn",
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
            console.log('****',cheers.text());
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
                "make": "Ranier",
                "model": "mtnx",
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
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
                "make": "Ranier",
                "model": "olympic",
                "package": "2speed",
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
            assert.equal(cheers.text(), 'not a known RANIER package');
        })
    });
})
