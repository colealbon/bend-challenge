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
    logger.debug(`order.js.post <-- ${req}`);
    // DON'T START NOTHING, AIN'T GONNA BE NOTHING
    if (!req.body) return res.sendStatus(400)

    // CHECK IF ATTRIBUTES ARE PRESENT
    const order = require('../lib/order.js');
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
