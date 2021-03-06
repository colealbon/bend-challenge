import express, { Router }  from 'express';
import catchErrors from 'async-error-catcher';

const app = express()
const router = new Router();
const responseTime = require('response-time')
const config = require(__dirname + '/config/options.js');
const port = process.env.PORT || config.port || '3000';

const morgan = require('morgan')
app.use(morgan('tiny'))

import indexRoute from './routes/index';
app.use('/', indexRoute);

import orderRoute from './routes/order';
app.use('/orders', orderRoute);
app.use('/order', orderRoute);

app.use((err, req, res, next) => {
    console.error('ERROR:', err);
});

try {
    app.listen(port, function () {
      console.log('listening on port 3000!')
    })
} catch (err) {
    console.log('error: ', err);
}

module.exports = app;
