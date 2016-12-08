'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
//require("babel-polyfill");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let server = require('../app.js');
const http = require('http');
const fetch = require('node-fetch');
if (!server) server = http.createServer();

const assert = require('chai').assert;

suite('index', function() {
    test('check server pulse response ok', function() {
        return fetch('http://127.0.0.1:3000')
        .then(function(res) {
            assert.equal(res.ok, true);
        })
    });
})
