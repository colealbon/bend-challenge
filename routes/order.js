import { Router } from 'express';
const bodyParser = require('body-parser')
const objectAssign = require('object-assign');
const router = new Router();

var jsonParser = bodyParser.json()

router.get('/', async (req, res, next) => {
  try {
    res.send('ORDERS');
  } catch (err) {
    next(err);
  }
});

// POST /api/users gets JSON bodies
router.post('/', jsonParser, async (req, res, next) => {
    if (!req.body) return res.sendStatus(400)
    try {
        let orderObj = objectAssign(req.body);
        // refactor: could/should guard with lense or class here
        // except I like to say which missing param
        if (!orderObj.make) {
            res.status(400).send("missing attribute: make");
            return
        }
        if (!orderObj.model) {
            res.status(400).send("missing attribute: model");
            return
        }
        if (!orderObj.package) {
            res.status(400).send("missing attribute: package");
            return
        }
        if (!orderObj.customer) {
            res.status(400).send("missing attribute: customer");
            return
        }
        if (!orderObj.customer.id) {
            res.status(400).send("missing attribute: customer.id");
            return
        }
        if (!orderObj.customer.shipto) {
            res.status(400).send("missing attribute: customer.shipto");
            return
        }
        if (orderObj.customer.shipto === 'siberia') {
            res.status(400).send("negatron, siberia is too expensive");
            return
        }
        orderObj.status = 'success';
        res.status(200).json(orderObj)
    } catch (err) {
        next(err);
    }
})

export default router;
