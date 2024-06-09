const express = require("express");
const router = express.Router();

const orderController = require("../controllers/OrderController");

router.get("/", orderController.getAllOrders);
router.get("/:orderId", orderController.getOrderDetails);
router.post("/", orderController.createNewOrder);
router.put('/:orderId', orderController.changeOrderStatus)
// router.put("/", orderController.editVoucher);
// router.put("/disable", orderController.disableVoucher);
// router.delete("/", orderController.removeVoucher);

module.exports = router;
