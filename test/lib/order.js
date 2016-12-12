'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const assert = require('chai').assert;

suite('validate order', function() {
    const order = require('../../lib/order')
    test('missing make parameter should cause error', async function() {
        let orderStr = {
                    	"model": "roadrunner",
                    	"package": "elite",
                    	"customer": {
                            "id": "1976",
                            "shipto": "nebraska"
                        }
                    }
        let validatedOrder = await order.validateOrder(orderStr);
        assert.equal(validatedOrder.status, 'invalid')
    });
    test('missing model parameter should cause error', async function() {
        let orderStr = {
            "make": "ACME Autos",
            "package": "elite",
            "customer": {
                "id": "1976",
                "shipto": "nebraska"
            }}
        let validatedOrder = await order.validateOrder(orderStr);
        assert.equal(validatedOrder.status, 'invalid')
    });
    test('missing package parameter should cause error', async function() {
        let orderStr = {
            "make": "ACME Autos",
            "model": "roadrunner",
            "customer": {
                "id": "1976",
                "shipto": "nebraska"
            }}
        let validatedOrder = await order.validateOrder(orderStr);
        assert.equal(validatedOrder.status, 'invalid')
    });
    test('missing customerid parameter should cause error', async function() {
        let orderStr = {
            "make": "ACME Autos",
            "model": "roadrunner",
            "package": "elite"
        }
        let validatedOrder = await order.validateOrder(orderStr);
        assert.equal(validatedOrder.status, 'invalid')
    });
    test('siberia should cause error', async function() {
        let orderStr = {
            "make": "ACME Autos",
            "model": "roadrunner",
            "package": "elite",
            "customer": {
                "id": "1976",
                "shipto": "siberia"
            }}
        let validatedOrder = await order.validateOrder(orderStr);
        assert.equal(validatedOrder.status, 'invalid')
    });
})
