'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');
const config = require(__dirname + '/../../config/options.js');

// launch server that relays orders to vendors
let webserver = require(__dirname + '/../../app.js');
const http = require('http');
if (!webserver) webserver = http.createServer();

// launch server that sends fake order confirmations
let jsonServer = require('json-server')
let acmeserver = jsonServer.create()
let router = jsonServer.router()
let middlewares = jsonServer.defaults()

acmeserver.use(middlewares)
acmeserver.use(jsonServer.bodyParser)
acmeserver.use(function (req, res, next) {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  next()
})

router.render = function (req, res) {
  res.json({
   order: Math.floor(Math.random() * 999999)
  })
}
acmeserver.use(router)

after(function() {
    delete require.cache[require.resolve('mongoose')];
});

suite('round trip report', function() {
    test('input', async function() {
        const insertData = await fetch('http://127.0.0.1:3000/order', {
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
            //console.log(body);
            const cheers = cheerio.load(body)
            const cheersObj = JSON.parse(cheers.text())
            assert.equal(cheersObj.status, 'success');
            return cheersObj;
        });
        //console.log(insertData);
        const requestData = await fetch('http://127.0.0.1:3000/order', {
            method: "GET"
            })
        .then(function(res) {
            assert.equal(res.ok, true);
        })
    });
});
