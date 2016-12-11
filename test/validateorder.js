'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const fetch = require('node-fetch');
const assert = require('chai').assert;
const cheerio = require('cheerio');

suite('validate order - webapi', function() {
    test('missing make parameter should cause error', function() {
        return fetch('http://127.0.0.1:3000/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{
            	"model": "roadrunner",
            	"package": "elite",
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
            	"make": "ACME Autos",
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
            	"make": "ACME Autos",
            	"model": "roadrunner",
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
            	"make": "ACME Autos",
            	"model": "roadrunner",
            	"package": "elite"
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
    test('siberia should cause error', function() {
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
