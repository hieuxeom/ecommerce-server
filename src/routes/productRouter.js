const express = require("express");
const router = express.Router();
const multer = require("multer");

const productController = require("../controllers/ProductController");

const productImageStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/images");
	},
	filename: function (req, file, cb) {
		let ext = file.mimetype.split("/")[1];
		cb(null, Date.now() + "" + "." + ext);
	},
});

const productImageUpload = multer({ storage: productImageStorage });

router.get("/", productController.handleGetProduct);

router.get("/:productId", productController.getProductById);

router.post("/", productImageUpload.single("productImage"), productController.createNewProduct);

router.put("/", productController.handlePutProduct);

router.delete("/:productId", productController.removeProduct);
module.exports = router;
