const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ProductReview = new Schema(
	{
		userName: { type: String, required: true },
		reviewContent: { type: String, required: true },
		reviewStar: { type: Number, required: true },
	},
	{
		timestamps: true,
	}
);
const ProductComment = new Schema(
	{
		userName: { type: String, required: true },
		commentContent: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

const ProductModel = new Schema(
	{
		productName: { type: String, required: true },
		productPrice: { type: Number, required: true },
		isDiscount: { type: Boolean, default: false },
		discountPercents: { type: Number, default: 0 },
		productImage: { type: String, required: true },
		productColor: { type: String, default: "#000" },
		productCategory: {
			type: String,
			required: true,
		},
		productReviews: { type: [ProductReview], default: [] },
		productComments: { type: [ProductComment], default: [] },
		productRating: { type: Number, default: 5 },
		productStock: { type: Number, default: 0 },
		isDeleted: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("product", ProductModel);
