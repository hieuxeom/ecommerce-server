const ProductModel = require("../models/ProductModel")
const { decodeToken } = require("../utils/token");

class ReviewController {
    constructor() {
    }

    async getAllReviews(req, res, next) {
    }

    async createNewReview(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found"
            })
        }
        try {
            const { userName } = decodeToken(token);
            const { reviewContent, reviewStar } = req.body;
            const { productId } = req.params;

            const productData = await ProductModel.findById(productId);

            if (!productData) {
                return res.status(400).json({
                    status: "error",
                    message: "No products were found with the id provided"
                })
            }

            let { productReviews } = productData;

            productReviews.push({
                userName,
                reviewContent,
                reviewStar
            })

            await productData.save();

            return res.status(201).json({
                status: "success",
                message: "Reviews successfully"
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired",
                })
            } else {
                return res.status(401).json({
                    status: "error",
                    message: err.name + ' - ' + err.message,
                })
            }

        }
    }

}

module.exports = new ReviewController();