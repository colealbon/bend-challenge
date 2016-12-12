'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const assert = require('chai').assert;

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
//acmeserver.use('/acme/api/v45.1', jsonServer.router('../fake/acme.json'))
// for mock JWT we need two routes like so:
// server.use('/users', jsonServer.router('comments.json')) // { "comments": [ ... ] }
// server.use('/other-route', jsonServer.router('other-db.json'))
router.render = function (req, res) {
  res.json({
   order: Math.floor(Math.random() * 999999)
  })
}
acmeserver.use(router)

try {
    acmeserver.listen(4051, function () {
      console.log('ACME JSON Server is running on 3051')
    })
} catch (err) {}

const supplier = require('../../lib/supplier')

suite('ACME place order', function() {
    test('happy path should succeed' , async function() {
        let order = {
                    "make": "ACME Autos",
                    "model": "roadrunner",
                    "package": "elite",
                    "customer": {
                        "id": "1976",
                        "shipto": "nebraska"
                    }
                }
        let placedOrder = await supplier.placeOrder(order);
        assert.equal(placedOrder.status, 'success')
    });
    test('should error if bad model' , async function() {
        let order = {
                    "make": "ACME Autos",
                    "model": "mustang",
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
                    "make": "ACME Autos",
                    "model": "roadrunner",
                    "package": "lemon",
                    "customer": {
                        "id": "1976",
                        "shipto": "nebraska"
                    }}
        let placedOrder = await supplier.placeOrder(order);
        assert.equal(placedOrder.status, 'fail')
    });
})
