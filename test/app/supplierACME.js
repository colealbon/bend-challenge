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

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var mockgoose = require('mockgoose');

before(function(done) {
    mockgoose(mongoose).then(function() {
        mongoose.connect(config.mongoose_url, function(err) {
            done(err);
        });
    });
});

after(function() {
    delete require.cache[require.resolve('mongoose')];
});

acmeserver.listen(3051, function () {
  console.log('ACME JSON Server is running on 3051')
})

suite('legit supplier orders ACME should pass', function() {
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
        .then(function(body) {
            assert.equal(body, 'unknown car make/model');
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
