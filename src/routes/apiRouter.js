var express = require("express");
var router = express.Router();

const productRouter = require("./productRouter");
const categoryRouter = require("./categoryRouter");
const userRouter = require("./userRouter");
const cartRouter = require("./cartRouter");
const authRouter = require("./authRouter");
const voucherRouter = require("./voucherRouter");
const orderRouter = require("./orderRouter");
const emailRouter = require("./emailRouter");

router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/carts", cartRouter);
router.use("/vouchers", voucherRouter);
router.use("/orders", orderRouter);
router.use("/email", emailRouter)
module.exports = router;
