var express = require("express");
var router = express.Router();

// const productController = require("../controllers/ProductController");
const productRouter = require("./productRouter");

router.use("/products", productRouter);

module.exports = router;
