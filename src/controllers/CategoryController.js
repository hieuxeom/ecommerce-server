const CategoryModel = require("../models/CategoryModel"); // Assuming the schema is in a file named ProductModel.js
class CategoryController {
	constructor() {}

	async getAllCategories(req, res, next) {
		const listCategories = await CategoryModel.find({});

		return res.status(200).json({
			status: "success",
			message: "",
			data: listCategories,
		});
	}

	async getCategoryById(req, res, next) {}

	async createNewCategory(req, res, next) {
		const { categoryName } = req.body;

		if (!categoryName) {
			return res.json(400).json({
				status: "failure",
				message: "Missing category name",
			});
		}

		const newCategory = new CategoryModel({
			categoryName,
		});

		await newCategory.save();

		return res.status(200).json({
			status: "success",
		});
	}

	async handlePutCategory(req, res, next) {}

	async editCategory(req, res, next) {}

	async softDeleteCategory(req, res, next) {}

	async removeCategory(req, res, next) {}
}

module.exports = new CategoryController();
