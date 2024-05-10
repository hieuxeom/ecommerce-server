const ProductModel = require("../models/ProductModel"); // Assuming the schema is in a file named ProductModel.js
class AdminController {
	constructor() {
		this.handleGetProduct = this.handleGetProduct.bind(this);
	}

	async handleGetProduct(req, res, next) {
		const { _s } = req.query;

		if (_s) {
			this.getProductsBySearchKey(_s, res);
		} else {
			this.getAllProducts(res);
		}
	}

	async getAllProducts(res) {
		const listProductData = await ProductModel.find({});

		return res.status(200).json({
			status: "success get",
			data: listProductData,
		});
	}

	async getProductsBySearchKey(_s, res) {
		const listProductData = await ProductModel.find({
			productName: {
				$regex: new RegExp(_s, "i"),
			},
		});

		return res.status(200).json({
			status: "success search",
			data: listProductData,
		});
	}

	// async getProductsByCategory(req, res, next) {}0
	async getProductById(req, res, next) {}

	async createNewProduct(req, res, next) {
		const { productName, productPrice, isDiscount, discountPercents, productImage, productCategory } = req.body;

		const checkRequired = [
			!productName && "productName",
			!productPrice && "productPrice",
			isDiscount === undefined && "isDiscount",
			!discountPercents && "discountPercents",
			!productImage && "productImage",
			!productCategory && "productCategory",
		].filter((item) => item);

		if (checkRequired.length > 0) {
			return res.status(404).json({
				status: "failure",
				message: "Missing some required fields, please fill all required fields before submitting",
				missingFields: checkRequired,
			});
		}

		const newProduct = new ProductModel({
			productName,
			productPrice,
			isDiscount,
			discountPercents,
			productImage,
			productCategory,
		});

		await newProduct.save();

		return res.status(201).json({
			status: "success",
		});
		// 	{
		// 		productName: "Smartphone",
		// 		productPrice: 599,
		// 		isDiscount: true,
		// 		discountPercents: 10,
		// 		productImage: "smartphone.jpg",
		// 		productColor: "#000",
		// 		productCategory: "Electronics",
		// 		productReviews: [
		// 			{
		// 				userName: "user1",
		// 				reviewContent: "Great phone!",
		// 				reviewStar: 5,
		// 			},
		// 			{
		// 				userName: "user2",
		// 				reviewContent: "Works well, but battery life could be better.",
		// 				reviewStar: 4,
		// 			},
		// 		],
		// 		productComments: [
		// 			{
		// 				userName: "user3",
		// 				commentContent: "I agree with user2, the battery life could be improved.",
		// 			},
		// 		],
		// 		productRating: 4.5,
		// 		productStock: 100,
		// 		isDeleted: false,
		// 	},
	}

	async handlePutProduct(req, res, next) {}

	async editProduct(req, res, next) {}

	async softDeleteProduct(req, res, next) {}

	async removeProduct(req, res, next) {}
}

module.exports = new AdminController();
