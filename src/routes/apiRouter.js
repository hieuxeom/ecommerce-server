var express = require("express");
var router = express.Router();

// const productController = require("../controllers/ProductController");
const productRouter = require("./productRouter");
const categoryRouter = require("./categoryRouter");

router.use("/products", productRouter);
router.use("/categories", categoryRouter);

module.exports = router;
