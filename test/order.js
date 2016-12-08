'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');

// // server.js
// var jsonServer = require('json-server')
// var server = jsonServer.create()
// var router = jsonServer.router('db.json')
// var middlewares = jsonServer.defaults()
//
// server.use(middlewares)
// server.use(router)
// server.listen(3000, function () {
//   console.log('JSON Server is running')
// })

suite('order', function() {
    test('check post response ok', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
            	"make": "Ford",
            	"model": "mustang II",
            	"package": "Ghia - yellow with white leather interior",
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
    test('missing make parameter should cause error', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
            	"model": "mustang II",
            	"package": "Ghia - yellow with white leather interior",
            	"customer": {
                    "id": "1976",
                    "shipto": "nebraska"
                }}`
            })
        .then(function(res) {
            assert.notEqual(res.ok, true);
            return res.text();
        })
        .then(function(body) {
            assert.equal(body, 'missing attribute: make');
        })
    });
    test('missing model parameter should cause error', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
            	"make": "Ford",
            	"package": "Ghia - yellow with white leather interior",
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
            assert.equal(body, 'missing attribute: model');
        })
    });
    test('missing package parameter should cause error', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
            	"make": "Ford",
            	"model": "mustang II",
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
            assert.equal(body, 'missing attribute: package');
        })
    });
    test('missing customerid parameter should cause error', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
            	"make": "Ford",
            	"model": "mustang II",
            	"package": "Ghia - yellow with white leather interior"
            }`
            })
        .then(function(res) {
            assert.notEqual(res.ok, true);
            return res.text()
        })
        .then(function(body) {
            assert.equal(body, 'missing attribute: customer');
        })
    });
    test('missing customerid parameter should cause error', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
            	"make": "Ford",
            	"model": "mustang II",
            	"package": "Ghia - yellow with white leather interior",
            	"customer": {
                    "id": "1976",
                    "shipto": "siberia"
                }}`
            })
        .then(function(res) {
            assert.notEqual(res.ok, true);
            return res.text()
        })
        .then(function(body) {
            assert.equal(body, 'negatron, siberia is too expensive');
        })
    });
})
