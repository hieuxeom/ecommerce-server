const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CartItem = new Schema({
	productId: { type: String, required: true },
	quantity: { type: Number, required: true },
});

const UserCart = new Schema(
	{
		cartItems: { type: [CartItem], default: [] },
		voucherCode: { type: String, default: "" },
	},
	{
		timestamps: true,
	}
);

const UserAddress = new Schema({
	provinceId: { type: String, required: true },
	districtId: { type: String, required: true },
	wardId: { type: String, required: true },
	fullAddress: { type: String, required: true },
	isDefault: { type: Boolean, default: false },
});

const UserModel = new Schema(
	{
		userName: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		cart: { type: UserCart, default: { cartItems: [], voucherCode: "" } },
		listAddresses: { type: [UserAddress] },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("user", UserModel);
