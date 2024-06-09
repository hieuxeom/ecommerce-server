const express = require("express");
const router = express.Router();

const voucherController = require("../controllers/VoucherController");

router.get("/", voucherController.getAllVouchers);
router.get("/:voucherId", voucherController.getVoucherById);
router.post("/", voucherController.createNewVoucher);
router.put("/:voucherId", voucherController.editVoucher);
router.put("/disable", voucherController.disableVoucher);
router.delete("/", voucherController.removeVoucher);

module.exports = router;
