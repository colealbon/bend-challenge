import { Router } from 'express';

const bodyParser = require('body-parser')
const objectAssign = require('object-assign');
const router = new Router();
const config = require(__dirname + '/../config/options.js');
const winston = require('winston');

const jsonParser = bodyParser.json()

const logger = new(winston.Logger)({
    transports: [new(winston.transports.File)({
        filename: config.winston_log_file
    })],
    level: config.winston_log_level
});

const order = require('../lib/order.js');

// THE ENTRY POINT FOR "ORDER"
router.get('/', async (req, res) => {
    const orders = await order.listOrders();
    //console.log(orders);
    res.status(200).send({"orders": orders});
    return
})

router.post('/', jsonParser, async (req, res) => {
    logger.debug(`order.js.post <-- ${req}`);
    // DON'T START NOTHING, AIN'T GONNA BE NOTHING
    if (!req.body) return res.sendStatus(400)

    // CHECK IF ATTRIBUTES ARE PRESENT
    let validatedOrder = await order.validateOrder(req.body);
    if (validatedOrder.status === 'invalid') {
        logger.debug(`validate fail reason: ${validatedOrder.reason}`);
        res.status(400).send(validatedOrder.reason);
        return
    }
    // SUBMIT ORDER TO SUPPLIERS
    const supplier = require('../lib/supplier.js');
    let placedOrder = await supplier.placeOrder(validatedOrder);
    logger.silly(`order placed ${JSON.stringify(placedOrder)}`)
    if (placedOrder.status === 'fail') {
        logger.debug(`order fail reason: ${placedOrder.reason}`)
        res.status(400).send(placedOrder.reason || 'unknown car make/model');
        return;
    }
    // LOG ORDER TO MONGO
    res.status(200).send(placedOrder);
    let logSuccess = await order.persistOrder(placedOrder);
    logger.debug(`order placed submitting to mongodb --> ${JSON.stringify(placedOrder)}`)
    return;
})

export default router;
