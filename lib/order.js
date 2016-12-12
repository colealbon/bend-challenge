const config = require(__dirname + '/../config/options.js');

module.exports.persistOrder =  function (order) {
    var mongoose = require('mongoose')
    const Schema = mongoose.Schema;
    let orderObj = Object.assign(order);
    //let db = mongoose.connection;
    const OrderModel = require('../models/order.js');
    const newOrder = new OrderModel( orderObj );
    newOrder.save();
};

module.exports.validateOrder = function (order) {
    let orderObj = Object.assign(order);
    try {
        // refactor: could/should guard with lense or class here
        // we're validating  with mongoose, so maybe only use this on client
        // but we eventually might want to use this code on the client.
        if (!orderObj.make) {
            orderObj.status = 'invalid'
            orderObj.reason = "missing attribute: make"
            return orderObj
        }
        if (!orderObj.model) {
            orderObj.status = 'invalid'
            orderObj.reason = "missing attribute: model"
            return orderObj
        }
        if (!orderObj.package) {
            orderObj.status = 'invalid'
            orderObj.reason = "missing attribute: package"
            return orderObj
        }
        if (!orderObj.customer) {
            orderObj.status = 'invalid'
            orderObj.reason = "missing attribute: customer"
            return orderObj
        }
        if (!orderObj.customer.id) {
            orderObj.status = 'invalid'
            orderObj.reason = "missing attribute: customer.id"
            return orderObj
        }
        if (!orderObj.customer.shipto) {
            orderObj.status = 'invalid'
            orderObj.reason = "missing attribute: customer.shipto"
            return orderObj
        }
        if (orderObj.customer.shipto === 'siberia') {
            orderObj.status = 'invalid'
            orderObj.reason = "negatron, siberia is too expensive"
            return orderObj
        }
        orderObj.status = 'valid';
        return orderObj;
    } catch (err) {
        orderObj.status = 'invalid'
        orderObj.reason = `unknown: ${err}`
        return orderObj;
    }
};
