var express = require("express");
var router = express.Router();

const productController = require("../controllers/ProductController");

router.get("/", productController.handleGetProduct);

router.get("/:productId", productController.getProductById);

router.post("/", productController.createNewProduct);

router.put("/", productController.handlePutProduct);

router.delete("/:productId", productController.removeProduct);
module.exports = router;
