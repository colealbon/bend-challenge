'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const assert = require('chai').assert;

// launch server that sends fake order confirmations
let jsonServer = require('json-server')
let ranierserver = jsonServer.create()
let router = jsonServer.router()
let middlewares = jsonServer.defaults()

ranierserver.use(middlewares)
ranierserver.use(jsonServer.bodyParser)
ranierserver.use(function (req, res, next) {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  next()
})

// for mock JWT we need two routes like so:
// server.use('/users', jsonServer.router('comments.json')) // { "comments": [ ... ] }
// server.use('/other-route', jsonServer.router('other-db.json'))

router.render = function (req, res) {
  res.json({
   order: Math.floor(Math.random() * 999999)
  })
}
ranierserver.use(router)

try {
    ranierserver.listen(4050, function () {
      console.log('ACME JSON Server is running on 3051')
    })
} catch (err) {}

const supplier = require('../../lib/supplier')
const order = require('../../lib/order')

suite('RANIER place order', function() {
    test('happy path should succeed' , async function() {
        let order = {
            "make": "Ranier",
            "model": "pugetsound",
            "package": "mtn",
            "customer": {
                "id": "1976",
                "shipto": "nebraska"
            }}
        let placedOrder = await supplier.placeOrder(order);
        assert.equal(placedOrder.status, 'success')
    });
    test('should error if bad model' , async function() {
        let order = {
            "make": "Ranier",
            "model": "mtnx",
            "package": "elite",
            "customer": {
                "id": "1976",
                "shipto": "nebraska"
            }}
        let placedOrder = await supplier.placeOrder(order);
        assert.equal(placedOrder.status, 'fail')
    });
    test('should error if bad package' , async function() {
        let order = {
            "make": "Ranier",
            "model": "olympic",
            "package": "2speed",
            "customer": {
                "id": "1976",
                "shipto": "nebraska"
            }}
        let placedOrder = await supplier.placeOrder(order);
        assert.equal(placedOrder.status, 'fail')
    });
})
