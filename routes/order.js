import { Router } from 'express';

const bodyParser = require('body-parser')
const objectAssign = require('object-assign');
const router = new Router();
const config = require(__dirname + '/../config/options.js');
const winston = require('winston');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const jsonParser = bodyParser.json()

const logger = new(winston.Logger)({
    transports: [new(winston.transports.File)({
        filename: config.winston_log_file
    })],
    level: config.winston_log_level
});

// var mongoose = require('mongoose')
// const Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
//
// mongoose.connect(config.mongo_url);

async function placeOrderACME (order) {
    logger.debug(`placeOrderACME: <-- ${JSON.stringify(order)}`);
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
        orderObj.orderid = parseInt(JSON.parse(orderPlaced).order)
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
        orderObj.orderid = parseInt(JSON.parse(orderPlaced).order)
        orderObj.status = 'success';
        orderObj.reason = ' ';
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
        //let orderObj = Object.assign(order);

        let db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', async function() {
            console.log('Mongoose connected.');
        });
        const OrderModel = models.Order;
        const newOrder = new OrderModel( orderObj );
        newOrder.save();
    }
    catch (err) {
        logger.error('looks like mongo down', err)
    }
}

async function reportOrders() {
    try {
        logger.debug(`reportOrders: <--`);
        const OrderModel = models.Order;
        OrderModel.find({}, function (err, orders) {
            return orders;
        });
    }
    catch (err) {
        logger.error('looks like mongo down', err)
    }
}

// THE ENTRY POINT FOR "ORDER"
router.get('/', async (req, res, next) => {
        OrderModel.find({}, function (err, orders) {
            //if (err) console.error(err);
            logger.debug(orders); // <-- this prints
            //return orders;
            res.send('orders');
        });
        return
})

router.post('/', jsonParser, async (req, res) => {
    logger.debug('order.js.post <--');
    // DON'T START NOTHING, AIN'T GONNA BE NOTHING
    if (!req.body) return res.sendStatus(400)

    // CHECK IF PARAMETERS ARE GOOD
    const order = require('../lib/order.js')
    let validatedOrder = await order.validateOrder(req.body);
    logger.silly('validatedOrder <--> ', validatedOrder);
    if (validatedOrder.status === 'invalid') {
        res.status(400).send(validatedOrder.reason);
        return
    }
    // SUBMIT ORDER TO SUPPLIERS
    let placedOrder = {};
    placedOrder = await placeOrderACME(validatedOrder)
    placedOrder = await placeOrderRANIER(validatedOrder)
    logger.silly(`place order completed ${JSON.stringify(placedOrder)}`)
    if (placedOrder.status === 'fail') {
        logger.silly(`order fail reason: ${placedOrder.reason}`)
        res.status(400).send(placedOrder.reason || 'unknown car make/model');
        return;
    }
    // LOG ORDER TO MONGO
    logger.silly(`order placed submitting to mongodb --> ${JSON.stringify(placedOrder)}`)
    let logSuccess = await persistToMongo(placedOrder);
    res.status(200).send(placedOrder);
})

export default router;
