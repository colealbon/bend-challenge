'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');
const config = require(__dirname + '/../../config/options.js');

// launch server that relays orders to vendors
let webserver = require('../../app.js');
const http = require('http');
if (!webserver) webserver = http.createServer();

// launch server that sends fake order confirmations
let jsonServer = require('json-server')
let server = jsonServer.create()
let router = jsonServer.router()
let middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)
server.use(function (req, res, next) {
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
server.use(router)

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var mockgoose = require('mockgoose');

before(function(done) {
    mockgoose(mongoose).then(function() {
        mongoose.connect(config.mongoose_url, function(err) {
            const orderSchema = mongoose.Schema({
                make: String,
                model: String,
                package: String,
                customer: {
                    id: String,
                    shipto: String
                },
                status: String,
                reason: String,
                orderid: String
            });
            const OrderModel = mongoose.model('Order', orderSchema);
            done(err);
        });
    });
});

after(function() {
    delete require.cache[require.resolve('mongoose')];
});

server.listen(3051, function () {
  console.log('ACME JSON Server is running on 3051')
})

suite('place supplier orders ACME', function() {
    test('report orders (GET)', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
            },
            method: "GET"
        })
        .then(function(res) {
            assert.equal(res.ok, true);
            return res.text()
        })
        //fixme: this passes empty string better need test
        .then(function(body) {
            const cheers = cheerio.load(body)
            assert.notEqual(cheers.text(), '');
        })
    });
})
