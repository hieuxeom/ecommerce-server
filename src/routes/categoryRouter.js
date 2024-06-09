const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/CategoryController");

router.post("/deactivate", categoryController.deactivateCategory)
router.post("/reactivate", categoryController.reactivateCategory)

router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.post("/", categoryController.createNewCategory);
router.put("/", categoryController.editCategory);
router.delete("/", categoryController.removeCategory);

module.exports = router;
