const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const UserModel = require("../models/UserModel");
const VoucherModel = require("../models/VoucherModel");

const {decodeToken} = require("../utils/token");

class OrderController {
    constructor() {
    }

    async getAllOrders(req, res, next) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {

            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const listOrders = await OrderModel.find().sort({
                orderDate: -1,
            });

            return res.status(200).json({
                status: 'success',
                message: 'Successfully get list orders',
                data: listOrders
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async getOrderDetails(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {

            const {orderId} = req.params;

            const orderData = await OrderModel.findById(orderId);

            return res.status(200).json({
                status: 'success',
                message: 'Successfully get order details',
                data: orderData,
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    getOrdersByUserId(req, res, next) {
    }

    async createNewOrder(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {_id} = decodeToken(token);
            const postData = req.body;
            //
            const orderData = {
                ...postData,
                customerId: _id,
            }

            const {orderItems} = postData;
            const {voucherCode} = postData;

            await VoucherModel.findOneAndUpdate({
                voucherCode,
            }, {
                $inc: {
                    usedCount: 1
                }
            })

            await Promise.all(orderItems.map((item) => {
                return ProductModel.findByIdAndUpdate(item.productId, {

                    $inc: {
                        productStock: -item.quantity,
                        soldCount: item.quantity,
                    }

                })
            }))
            const newOrder = new OrderModel(orderData);

            await newOrder.save();

            const userData = await UserModel.findById(_id);

            userData.cart = {
                cartItems: [],
                voucherCode: "",
                totalPrice: 0,
                discountPrice: 0,
                deliveryFee: 0,
                subTotalPrice: 0,
            };

            userData.save();

            return res.status(201).json({
                status: "success",
                message: "Order created successfully",
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

    async changeOrderStatus(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {

            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const {orderId} = req.params;

            const {orderStatus} = req.body;

            await OrderModel.findByIdAndUpdate(orderId, {
                orderStatus
            })

            return res.status(200).json({
                status: 'success',
                message: 'Successfully changed order status',
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }
}

module.exports = new OrderController();
