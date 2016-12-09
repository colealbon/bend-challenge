import { Router } from 'express';
const bodyParser = require('body-parser')
const objectAssign = require('object-assign');
const router = new Router();
const config = require(__dirname + '/../config/options.js');
const winston = require('winston');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var mockgoose = require('mockgoose');

var jsonParser = bodyParser.json()

const logger = new(winston.Logger)({
    transports: [new(winston.transports.File)({
        filename: config.winston_log_file
    })],
    level: config.winston_log_level
});

function validateParams (order) {
    logger.silly(`validateteParams: <-- ${JSON.stringify(order)}`);
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
        logger.silly('validation passed');
        orderObj.status = 'success';
        orderObj.reason = '';
        return orderObj;
    } catch (err) {
        next(err);
    }
}

async function placeOrderACME (order) {
    logger.silly(`placeOrderACME: <-- ${JSON.stringify(order)}`);
    let orderObj = objectAssign(order);
    if (orderObj.orderid) {
        // we already processed it, bail
        return orderObj;
    }
    // IF it's not an ACME car model, then bail
    if (['anvil','wile','roadrunner'].indexOf(orderObj.model) === -1) {
        logger.silly('not ACME car model')
        return orderObj;
    }
    // IF it's not an ACME car package, then bail
    if (['std','super','elite'].indexOf(orderObj.package) === -1) {
        logger.silly('not ACME package')
        orderObj.status = 'fail'
        orderObj.reason='not a known ACME package'
        return orderObj;
    }

    try {
        logger.silly('it is ACME:')
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
            logger.silly(`response from ACME placeOrder page ${cheers.text()}`)
            return cheers.text();
        })
        // bad practice: replacing here instead of properly dealing with json
        orderObj.orderid = parseInt(JSON.parse(orderPlaced).body.split(":")[1]
            .replace(/\}/g, '')
            .replace(/\"/g, '')
            .replace(/\\/g, '')
            .replace(/ /g, ''))
        orderObj.status = 'success';
        orderObj.reason = ' ';
        return orderObj;

    }
    catch (err) {
        logger.error(err);
        orderObj.status = 'fail'
        orderObj.reason = `failed to place ACME order ${err}`
        return orderObj;
    }
}

async function placeOrderRANIER (order) {
    logger.silly(`placeOrderRANIER: <-- ${JSON.stringify(order)}`);
    let orderObj = objectAssign(order);
    if (orderObj.orderid) {
        //we already processed it.
        return orderObj;
    }
    if (['pugetsound','olympic'].indexOf(orderObj.model) === -1){
        logger.silly("model not ranier")
        orderObj.status = 'fail';
        return orderObj
    }
    if (['mtn','ltd','14k'].indexOf(orderObj.package) === -1) {
        logger.silly('not RANIER package')
        orderObj.status = 'fail';
        orderObj.reason='not a known RANIER package'
        return orderObj;
    }
    try {
        logger.silly('it is RANIER:')
        let orderPlaced = await fetch(`http://${config.supplier_ranier_url}:${config.supplier_ranier_port}`, {
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
            logger.silly(`response from RANIER placeOrder page ${cheers.text()}`)
            return cheers.text();
        });
        // bad practice: replacing here instead of properly dealing with json
        logger.silly(orderPlaced)
        orderObj.orderid = parseInt(JSON.parse(orderPlaced).body.split(":")[1]
            .replace(/\}/g, '')
            .replace(/\"/g, '')
            .replace(/\\/g, '')
            .replace(/ /g, ''));
        orderObj.status = 'success';
        orderObj.reason = '';

        logger.silly(`RANIER: --> ${JSON.stringify(orderObj)}`);
        return orderObj;
    }
    catch (err) {
        logger.error(err);
        return orderObj;
    }
    return orderObj
}
async function persistToMongo(order) {
    try {
        logger.silly(`persistToMongo: <-- ${JSON.stringify(order)}`);
        let orderObj = objectAssign(order);
        mockgoose(mongoose).then(function() {
        mongoose.connect('mongodb://127.0.0.1/orders', function(err, db) {
            if (!db) {
                return
            }
            mongoosedb = this.db;
            db.collection('orders').insertOne(orderObj);
            });
        });
    }
    catch (err) {
        logger.error('looks like mongo down', err)
    }
}

// THE ENTRY POINT FOR "ORDER"
router.post('/', jsonParser, async (req, res, next) => {
    // DON'T START NOTHING, AIN'T GONNA BE NOTHING
    if (!req.body) return res.sendStatus(400)

    // CHECK IF PARAMETERS ARE GOOD
    let validatedOrder = await validateParams(req.body);
    if (validatedOrder.status === 'fail') {
        res.status(400).send(validatedOrder.reason);
        return
    }
    // SUBMIT ORDER TO SUPPLIERS
    let placedOrder = await JSON.parse('{"status":"fail"}')
    placedOrder.status = 'fail'; // this will be success if we find a car.
    placedOrder = await placeOrderACME(validatedOrder)
    placedOrder = await placeOrderRANIER(validatedOrder)
    logger.silly(`place order completed ${JSON.stringify(placedOrder)}`)
    if (placedOrder.status === 'fail') {
        logger.silly(`order fail reason: ${placedOrder.reason}`)
        res.status(400).send(placedOrder.reason || 'unknown car make/model');
        return
    }
    // LOG ORDER TO MONGO
    logger.silly(`order placed submitting to mongodb --> ${JSON.stringify(placedOrder)}`)
    res.status(200).send(placedOrder);
    let logSuccess = await persistToMongo(placedOrder);
    return
})

export default router;
