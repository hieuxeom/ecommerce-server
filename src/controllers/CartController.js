const {decodeToken} = require("../utils/token");

const UserModel = require("../models/UserModel");

const VoucherController = require("./VoucherController");

class CartController {
    constructor() {
        this.editCartVoucher = this.editCartVoucher.bind(this);
    }

    async getCurrentUserCart(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {_id} = decodeToken(token);

            const {cart} = await UserModel.findById(_id);

            return res.status(200).json({
                status: "success",
                message: "",
                data: cart,
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired",
                });
            } else {
                return res.status(401).json({
                    status: "error",
                    message: err.name + " - " + err.message,
                });
            }
        }
    }

    async addProductToCart(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }
        try {
            const {_id} = decodeToken(token);
            const {productId, quantity, productVariant} = req.body;

            const userData = await UserModel.findById(_id);

            const {cart: userCart} = userData;

            const {cartItems} = userCart;

            let isProductExists = false;

            cartItems.forEach((item) => {
                if (item.productId === productId.toString() && item.productVariant === productVariant) {
                    item.quantity += quantity;
                    isProductExists = true;
                }
            });

            if (!isProductExists) {
                cartItems.push({
                    productId,
                    quantity,
                    productVariant,
                });
            }
            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Added product to cart successfully",
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired",
                });
            } else {
                return res.status(401).json({
                    status: "error",
                    message: err.name + " - " + err.message,
                });
            }
        }
    }

    async setNewQuantity(req, res, next) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }
        try {
            const {_id} = decodeToken(token);

            const {productId, productVariant, newQuantity} = req.body;

            const userData = await UserModel.findById(_id);

            const {cart: userCart} = userData;

            let {cartItems} = userCart;

            cartItems.forEach((item) => {
                if (item.productId === productId.toString() && item.productVariant === productVariant) {
                    item.quantity = newQuantity;
                }
            });

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Update new quantity successfully",
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired",
                });
            } else {
                return res.status(401).json({
                    status: "error",
                    message: err.name + " - " + err.message,
                });
            }
        }
    }

    async deleteProductInCart(req, res, next) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }
        try {
            const {_id} = decodeToken(token);

            const {productId, productVariant} = req.body;

            const userData = await UserModel.findById(_id);

            const {cart: userCart} = userData;
            let {cartItems} = userCart;
            userData.cart.cartItems = cartItems.filter((item) => {
                if (item.productId !== productId) {
                    return item;
                }

                if (item.productId === productId && item.productVariant !== productVariant) {
                    return item;
                }
            });

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Delete product successfully",
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired",
                });
            } else {
                return res.status(401).json({
                    status: "error",
                    message: err.name + " - " + err.message,
                });
            }
        }
    }

    async editCartVoucher(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {_id} = decodeToken(token);

            const userData = await UserModel.findById(_id);

            let {voucherCode} = req.body;
            voucherCode = voucherCode.toLowerCase()

            if (voucherCode === '') {
                userData.cart.voucherCode = voucherCode;

                await userData.save();

                return res.status(200).json({
                    status: "success",
                    message: "Apply voucher successfully"
                });
            }

            if (await VoucherController.checkValidVoucher(voucherCode)) {
                const [voucherData] = await VoucherController.getVoucherByCode(voucherCode);

                const {minimumOrderValue} = voucherData;
                const {subTotalPrice} = userData.cart;

                if (minimumOrderValue > subTotalPrice) {
                    return res.status(400).json({
                        status: 'failure',
                        message: 'The voucher cannot be used because the order has not reached the minimum value'
                    })
                }

                userData.cart.voucherCode = voucherCode;

                await userData.save();

                return res.status(200).json({
                    status: "success",
                    message: "Apply voucher successfully"
                });
            } else {
                return res.status(400).json({
                    status: "failure",
                    message: "Invalid voucher",
                });
            }
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json(
                {
                    status: "error",
                    message: err.message
                }
            )
        }
    }

    async updateCartDetails(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {_id} = decodeToken(token);

            const {totalPrice, discountPrice, deliveryFee, subTotalPrice} = req.body;

            const userData = await UserModel.findById(_id);

            userData.cart.totalPrice = totalPrice;
            userData.cart.discountPrice = discountPrice;
            userData.cart.deliveryFee = deliveryFee;
            userData.cart.subTotalPrice = subTotalPrice;

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "",
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }
            return res.status(500).json({
                status: "error",
                message: err.message,
            });
        }
    }

    async removeUserCart(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        const {_id} = decodeToken(token);

        const userData = await UserModel.findById(_id);
        userData.cart.cartItems = [];

        await userData.save();

        return res.status(200).json({
            status: "success",
            message: "Delete cart successfully",
        });
    }
}

module.exports = new CartController();
