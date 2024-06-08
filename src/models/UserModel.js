const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CartItem = new Schema({
    productId: {type: String, required: true},
    productVariant: {type: String, required: false},
    quantity: {type: Number, required: true},
});

const UserCart = new Schema(
    {
        cartItems: {type: [CartItem], default: []},
        voucherCode: {type: String, default: ""},
        totalPrice: {type: Number, default: 0},
        discountPrice: {type: Number, default: 0},
        deliveryFee: {type: Number, default: 0},
        subTotalPrice: {type: Number, default: 0},
    },
    {
        timestamps: true,
    }
);

const UserAddress = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    fullAddress: {type: String, required: true},
    isDefault: {type: Boolean, default: false},
});

const UserModel = new Schema(
    {
        userName: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        cart: {type: UserCart, default: {cartItems: [], voucherCode: ""}},
        listAddresses: {type: [UserAddress]},
        role: {type: Number, default: 0, min: 0, max: 1},
        isActive: {type: Number, default: 1, min: 0, max: 1}
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("user", UserModel);
