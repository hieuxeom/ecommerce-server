const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");

// admin
router.get("/", userController.getAllUsers)
router.post("/deactivate", userController.deactivateUser)
router.post("/reactivate", userController.reactivateUser)

//basic user
router.get("/rftk", userController.handleRefreshToken);

router.post("/change-password", userController.changePassword);

router.post('/email-address', userController.changeEmailAddress);
router.post('/username', userController.changeUsername);

router.get("/me", userController.getCurrentUser);
router.get("/me/orders", userController.getUserOrders);

router.get("/me/address", userController.getUserAddress);
router.post("/me/address", userController.createNewAddress);

router.get("/me/address/:addressId", userController.getAddressDetails);
router.put("/me/address/:addressId", userController.editAddress);
router.delete("/me/address/:addressId", userController.removeAddress)

router.get("/:userId", userController.getUserInfo);

module.exports = router;
