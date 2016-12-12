const config = require(__dirname + '/../config/options.js');

// NEW VENDORS GO IN THIS FILE
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function placeOrderACME (order) {
    let orderObj = Object.assign(order);
    if (orderObj.orderid) {
        // we already processed it, bail
        return orderObj;
    }
    // IF it's not an ACME car model, then bail
    if (['anvil','wile','roadrunner'].indexOf(orderObj.model) === -1) {
        return orderObj;
    }
    // IF it's not an ACME car package, then bail
    if (['std','super','elite'].indexOf(orderObj.package) === -1) {
        orderObj.status = 'fail'
        orderObj.reason='not a known ACME package'
        return orderObj;
    }

    try {
        // todo 
        // Endpoint: POST /order   Content Type: xwwwformurlencoded
        // Parameters:   api_key="cascade.53bce4f1dfa0fe8e7ca126f91b3 5d3a6"
        let orderPlaced = await fetch(`http://${config.supplier_acme_url}:${config.supplier_acme_port}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `${JSON.stringify(orderObj)}`
            })
        .then(function(res) {
            return res.text()
        })
        .then(function(body) {
            const cheers = cheerio.load(body)
            return cheers.text();
        })
        orderObj.orderid = parseInt(JSON.parse(orderPlaced).order)
        orderObj.status = 'success';
        return orderObj;
    }
    catch (err) {
        orderObj.status = 'fail'
        orderObj.reason = `failed to place ACME order ${err}`
        return orderObj;
    }
}

async function placeOrderRANIER (order) {
    let orderObj = Object.assign(order);
    if (orderObj.orderid) {
        //we already processed it.
        return orderObj;
    }
    if (['pugetsound','olympic'].indexOf(orderObj.model) === -1){
        orderObj.status = 'fail';
        return orderObj
    }
    if (['mtn','ltd','14k'].indexOf(orderObj.package) === -1) {
        orderObj.status = 'fail';
        orderObj.reason='not a known RANIER package'
        return orderObj;
    }
    try {
        let orderPlaced = await fetch(`http://${config.supplier_ranier_url}:${config.supplier_ranier_port}`, {
            // TODO: RANIER SPEC NEEDS FORM INPUT HEADER
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `${JSON.stringify(orderObj)}`
            })
        .then(function(res) {
            return res.text()
        })
        .then(function(body) {
            const cheers = cheerio.load(body)
            return cheers.text();
        });
        orderObj.orderid = parseInt(JSON.parse(orderPlaced).order)
        orderObj.status = 'success';
        return orderObj;
    }
    catch (err) {
        orderObj.status = 'fail'
        orderObj.reason = `failed to place RANIER order ${err}`
        return orderObj;
    }
    return orderObj
}

module.exports.placeOrder = async function (order) {
    let placedOrder = Object.assign(order);
    placedOrder = await placeOrderACME(placedOrder)
    placedOrder = await placeOrderRANIER(placedOrder)
    return placedOrder;
};
