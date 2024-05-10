const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/CategoryController");

router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.post("/", categoryController.createNewCategory);
router.put("/", categoryController.handlePutCategory);
router.delete("/", categoryController.removeCategory);

module.exports = router;
