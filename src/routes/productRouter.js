const express = require("express");
const router = express.Router();
const multer = require("multer");

const productController = require("../controllers/ProductController");
const commentController = require("../controllers/CommentController");
const reviewController = require("../controllers/ReviewController");
const { checkAdminRole, checkToken } = require("../utils/middlewares-checker");

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

// admin route
router.post("/deactivate", [checkAdminRole], productController.deactivateProduct);
router.post("/reactivate", [checkAdminRole], productController.reactivateProduct);

// user route
router.get("/", productController.handleGetProduct);
router.get("/colors", productController.getProductColors);
router.get("/arrivals", productController.getNewArrivals)
router.get("/top-sell", productController.getTopSell)

router.get("/:productId", productController.getProductById);
router.post("/:productId/views", productController.increaseProductView)

router.get("/:productId/comments", commentController.getAllComments);
router.post("/:productId/comments", [checkToken], commentController.createNewComment);

router.get("/:productId/reviews", reviewController.getAllReviews);
router.post("/:productId/reviews", [checkToken], reviewController.createNewReview);

router.post("/", [checkAdminRole, productImageUpload.single("productImage")], productController.createNewProduct);

router.put("/", [checkAdminRole], productController.editProduct);

router.delete("/:productId", productController.removeProduct);

module.exports = router;
