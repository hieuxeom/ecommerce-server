const express = require('express');
const router = express.Router();

const emailController = require('../controllers/emailController');

router.post("/change-password", emailController.sendMailChangePassword)

router.post("/change-email", emailController.sendMailChangeEmailAddress)

module.exports = router;