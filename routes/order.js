import { Router } from 'express';
const bodyParser = require('body-parser')
//const objectAssign = require('object-assign');
const router = new Router();
var jsonParser = bodyParser.json()

function validateOrder (order) {;
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
        orderObj.status = 'success';
        return orderObj;
    } catch (err) {
        next(err);
    }
}

function sourceOrder (order) {
    let orderObj = order;
    orderObj.status = 'fail'
    try {
        orderObj.status = 'success';
        return orderObj;
    } catch (err) {
        next(err);
    }
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
    let validatedOrder = await validateOrder(req.body);
    if (validatedOrder.status === 'fail') {
        res.status(400).send(validatedOrder.reason);
        return
    }
    let sourcedOrder = await sourceOrder(validatedOrder);
    if (sourcedOrder.status === 'fail') {
        res.status(400).send(sourcedOrder.reason);
        return
    }
    res.status(200).send(sourcedOrder);
    return
})

export default router;
