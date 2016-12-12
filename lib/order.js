const config = require(__dirname + '/../config/options.js');
var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(config.mongo_url);

const Schema = mongoose.Schema;
const OrderModel = require('../models/order.js');

module.exports.persistOrder = async function (order) {
    let orderObj = Object.assign(order);
    const newOrder = new OrderModel( orderObj );
    var pausehere = await newOrder.save();
};

module.exports.listOrders = async function () {
    const allorders = await OrderModel.find().exec();
    return allorders;
};

module.exports.validateOrder = function (order) {
    let orderObj = Object.assign(order);
    try {
        // refactor: could/should guard with lense or class here
        // we're validating  with mongoose, so maybe only use this on client
        // we eventually might want to use this code on the client.
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
