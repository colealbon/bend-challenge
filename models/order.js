const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    make: String,
    model: String,
    package: String,
    customer: {
        id: String,
        shipto: String
    },
    status: String,
    reason: String,
    orderid: String
});

const Order = module.exports = mongoose.model('Order', orderSchema);
