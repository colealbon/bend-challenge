import { Router } from 'express';
const bodyParser = require('body-parser')
const objectAssign = require('object-assign');
const router = new Router();
const config = require(__dirname + '/../config/options.js');
const winston = require('winston');
var jsonParser = bodyParser.json()

const logger = new(winston.Logger)({
    transports: [new(winston.transports.File)({
        filename: config.winston_log_file
    })],
    level: config.winston_log_level
});

function validateParams (order) {
    let orderObj = order;
    try {
        orderObj.status = 'fail'
        // refactor: could/should guard with lense or class here
        // except I like to say which missing param
        if (!orderObj.make) {
            orderObj.reason = "missing attribute: make"
            return orderObj
        }
        if (!orderObj.model) {
            orderObj.reason = "missing attribute: model"
            return orderObj
        }
        if (!orderObj.package) {
            orderObj.reason = "missing attribute: package"
            return orderObj
        }
        if (!orderObj.customer) {
            orderObj.reason = "missing attribute: customer"
            return orderObj
        }
        if (!orderObj.customer.id) {
            orderObj.reason = "missing attribute: customer.id"
            return orderObj
        }
        if (!orderObj.customer.shipto) {
            orderObj.reason = "missing attribute: customer.shipto"
            return orderObj
        }
        if (orderObj.customer.shipto === 'siberia') {
            orderObj.reason = "negatron, siberia is too expensive"
            return orderObj
        }
        logger.debug('validation passed');
        orderObj.status = 'success';
        return orderObj;
    } catch (err) {
        next(err);
    }
}

async function placeOrderACME (order) {
    let orderObj = objectAssign(order);
    // IF it's not an ACME car, then bail
    if (['anvil','wile','roadrunner'].indexOf(orderObj.model) === -1) {
        logger.silly('not ACME')
        return orderObj;
    }
    orderObj.status = 'fail'
    try {
        logger.silly('it is ACME:')
        let orderPlaced = await JSON.parse('{"order": "1000"}');
        orderObj.orderId = orderPlaced.order
        orderObj.status = 'success';
        return orderObj;
    }
    catch (err) {
        logger.error(err);
        orderObj.reason = 'failed to place ACME order'
        return orderObj;
    }
// ■ ACME Autos:
// ● API URL: http://localhost:3050/acme/api/v45.1 ● Order Request:
// ○ Endpoint: POST /order
// ○ Content Type: x­www­form­urlencoded
// ○ Parameters:
// ■ api_key=“cascade.53bce4f1dfa0fe8e7ca126f91b3 5d3a6”
// ■ model=[anvil,wile,roadrunner]
// ■ package=[std,super,elite]
// ○ Response (as JSON)
// ■ Sample: {order: “1000”}
// ■ For implementation, can generate a random
// number for the order.
//
//     let orderObj = order;
//     orderObj.status = 'fail'
//     //3051
//     try {
//         fetch('http://127.0.0.1:3000/order', {
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             method: "POST",
//             body: `{
//                 "make": "Ford",
//                 "model": "mustang II",
//                 "package": "Ghia - yellow with white leather interior",
//                 "customer": {
//                     "id": "1976",
//                     "shipto": "nebraska"
//                 }}`
//             })
//         .then(function(res) {
//             assert.equal(res.ok, true);
//             return res.text()
//         })
//         .then(function(body) {
//             const cheers = cheerio.load(body)
//             const cheersObj = JSON.parse(cheers.text())
//             assert.equal(cheersObj.status, 'success');
//
//         })
//         orderObj.status = 'success';
//         return orderObj;
//     } catch (err) {
//         next(err);
//     }
}

async function placeOrderRANIER (order) {
    let orderObj = objectAssign(order);
    if (['pugetsound','olympic'].indexOf(orderObj.model) === -1)
        logger.silly("model not ranier")
        return
    orderObj.status = 'fail'
    try {
        logger.silly("model is ranier");
        let orderPlaced = await JSON.parse('{"order_id": “206”}');
        orderObj.orderId = orderPlaced.order_id
        orderObj.status = 'success';
        logger.silly('ranier order placed');
        return orderObj;
    }
    catch (err) {
        logger.silly(err);
        orderObj.reason = 'failed to place RANIER order'
        return orderObj;
    }
    return orderObj
    //3050
// ● API URL: http://localhost:3051/r ● Token Request:
// ○ You have to get a one­time token from this supplier for submitting an order.
// ■ GET /nonce_token
// ■ Parameters:
// ● storefront=”ccas­bb9630c04f”
// ■ Response Sample:
// ● {nonce_token: “ff6bfd673ab6ae03d8911”}
// ● For implementation, you can just fake a
// token response.
// ● Order Request
// ○ Endpoint: POST /request_customized_model ○ Parameters
//
//     ■ token=”ff6bfd673ab6ae03d8911” ■ model=[pugetsound,olympic]
// ■ custom=[mtn,ltd,14k]
// ○ Response (as JSON)
// ■ Sample: {order_id: “206”}
// ■ For implementation, can generate a random number for the order_id.
}

router.get('/', async (req, res, next) => {
  try {
    res.send('ORDERS');
  } catch (err) {
    next(err);
  }
});

router.post('/', jsonParser, async (req, res, next) => {
    if (!req.body) return res.sendStatus(400)

    // CHECK IF PARAMETERS ARE GOOD
    let validatedOrder = await validateParams(req.body);
    if (validatedOrder.status === 'fail') {
        res.status(400).send(validatedOrder.reason);
        return
    }
    // SUBMIT ORDER TO SUPPLIERS
    let placedOrder = await JSON.parse('{"status":"fail"}')
    placedOrder = await placeOrderACME(validatedOrder) || placedOrder
    placedOrder = await placeOrderRANIER(validatedOrder) || placedOrder
    if (placedOrder.status === 'fail') {
        logger.silly('order fail unknown car make/model')
        res.status(400).send(placedOrder.reason || 'unknown car make/model');
        return
    }
    // LOG ORDER TO MONGO

    res.status(200).send(placedOrder);
    return
})

export default router;
