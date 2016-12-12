'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');
const config = require(__dirname + '/../../config/options.js');
const order = require(__dirname + '/../../lib/order.js');

// launch server that relays orders to vendors
let webserver = require(__dirname + '/../../app.js');
const http = require('http');
if (!webserver) webserver = http.createServer();
// launch server that sends fake order confirmations
let jsonServer = require('json-server')
let acmeserver = jsonServer.create()
let router = jsonServer.router()
let middlewares = jsonServer.defaults()

router.render = function (req, res) {
  res.json({
   order: Math.floor(Math.random() * 999999)
  })
}
acmeserver.use(router)

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var mockgoose = require('mockgoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;
const OrderModel = require('../../models/order.js');

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

suite('orders report', function() {
    test ('listOrders function returns something', async function() {
        let orderObj = {
            "make": "ACME Autos",
            "model": "roadrunner",
            "package": "elite",
            "customer": {
                "id": "1976",
                "shipto": "nebraska"
            }};
        const newOrder = new OrderModel( orderObj );
        const pausehere = newOrder.save();
        const allorders = order.listOrders();
        assert.notEqual(allorders,undefined);
        assert.notEqual(allorders,{});
        return;
    });
    test ('orders page returns something', async function() {
        let orderObj = {
            "make": "ACME Autos",
            "model": "roadrunner",
            "package": "elite",
            "customer": {
                "id": "1976",
                "shipto": "nebraska"
            }};
        const newOrder = new OrderModel( orderObj );
        const pausehere = newOrder.save();
        const requestData = await fetch('http://127.0.0.1:3000/orders', {
            method: "GET"
            })
        .then(function(res) {
            assert.equal(res.ok, true);
            return res.json()
        })
        .then(function(json) {
            console.log(JSON.stringify(json));
        })
    })
    // test('input', async function() {
    //     const insertData = await fetch('http://127.0.0.1:3000/order', {
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //         method: "POST",
    //         body: `{
    //             "make": "ACME Autos",
    //             "model": "roadrunner",
    //             "package": "elite",
    //             "customer": {
    //                 "id": "1976",
    //                 "shipto": "nebraska"
    //             }}`
    //         })
    //     .then(function(res) {
    //         assert.equal(res.ok, true);
    //         return res.text()
    //     })
    //     .then(function(body) {
    //         console.log(body);
    //         const cheers = cheerio.load(body)
    //         const cheersObj = JSON.parse(cheers.text())
    //         assert.equal(cheersObj.status, 'success');
    //         return cheersObj;
    //     });
    //     //console.log(insertData);

    // });
});
