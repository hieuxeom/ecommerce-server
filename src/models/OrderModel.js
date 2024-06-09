const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderItem = new Schema({
    productId: {type: String, required: true},
    productVariant: {type: String, required: true},
    quantity: {type: Number, required: true},

});

const CustomerInfo = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    fullAddress: {type: String, required: true},
});

const orderSchema = new mongoose.Schema({
    customerId: {type: String, required: true},
    orderItems: [OrderItem],
    totalPrice: {type: Number, required: true},
    subTotalPrice: {type: Number, required: true},
    discountPrice: {type: Number, required: true},
    deliveryFee: {type: Number, required: true},
    orderDate: {type: Date, default: Date.now},
    voucherCode: {type: String},
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    customerInfo: CustomerInfo,
});

// Create the model for the order history

module.exports = mongoose.model("orders", orderSchema);
