const express = require("express");
const router = express.Router();

const authController = require("../controllers/AuthController");

router.get("/", authController.index);
router.get("/admin", authController.checkAdmin);
router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);

module.exports = router;
