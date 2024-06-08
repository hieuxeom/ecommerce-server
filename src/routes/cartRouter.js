const express = require("express");
const router = express.Router();

const cartController = require("../controllers/CartController");

router.get("/", cartController.getCurrentUserCart);
router.post("/", cartController.addProductToCart);
router.put("/", cartController.setNewQuantity);
router.put("/delete", cartController.deleteProductInCart);
router.put("/voucher", cartController.editCartVoucher);
router.put("/update", cartController.updateCartDetails);
router.delete("/", cartController.removeUserCart);

module.exports = router;
