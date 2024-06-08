const CategoryModel = require("../models/CategoryModel");
const ProductModel = require("../models/ProductModel");

const productController = require("./ProductController");

const {decodeToken} = require("../utils/token");

class CategoryController {
    constructor() {
        this.getCategoryById = this.getCategoryById.bind(this);
    }

    async getAllCategories(req, res, next) {

        const {onlyActive} = req.query;

        let filterOptions = {}

        if (onlyActive === 'true') {
            filterOptions.isActive = true;
        }

        const listCategories = await CategoryModel.find(filterOptions);

        return res.status(200).json({
            status: "success",
            message: "",
            data: listCategories,
        });
    }

    async getCategoryById(req, res, next) {
        const {categoryId} = req.params;

        if (!categoryId) {
            return this.getAllCategories(req, res, next);
        }

        const categoryData = await CategoryModel.findById(categoryId);

        return res.status(200).json({
            status: "success",
            message: "",
            data: categoryData,
        });
    }

    async createNewCategory(req, res, next) {

        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const {categoryName, queryParams, isActive} = req.body;

            if (!categoryName) {
                return res.json(400).json({
                    status: "failure",
                    message: "Missing category name",
                });
            }

            if (!queryParams) {
                return res.json(400).json({
                    status: "failure",
                    message: "Missing queryParams",
                });
            }

            const newCategory = new CategoryModel({
                categoryName,
                queryParams,
                isActive
            });

            await newCategory.save();

            return res.status(200).json({
                status: "success",
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async deactivateCategory(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {

            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const {categoryId} = req.body

            await CategoryModel.findByIdAndUpdate(categoryId, {
                isActive: 0
            })

            return res.status(200).json({
                status: 'success',
                message: 'Deactivated category successfully'
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async reactivateCategory(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {

            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const {categoryId} = req.body

            await CategoryModel.findByIdAndUpdate(categoryId, {
                isActive: 1
            })

            return res.status(200).json({
                status: 'success',
                message: 'Reactivated category successfully'
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async editCategory(req, res, next) {

        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const {categoryId, categoryName, queryParams, isActive} = req.body;

            const categoryData = await CategoryModel.findById(categoryId);

            categoryData.categoryName = categoryName
            categoryData.isActive = isActive ? 1 : 0;

            if (categoryData.queryParams !== queryParams) {
                const listProductsWithCategory = await ProductModel.find({
                    productCategory: categoryData.queryParams
                })

                const promiseChanges = listProductsWithCategory.map((product) => {
                    return new Promise((resolve, reject) => {
                        productController.handleChangeProductCategory(product._id, queryParams);
                    })
                })

                await Promise.all(promiseChanges)

                categoryData.queryParams = queryParams
            } else {
                console.log(false);
            }
            await categoryData.save();

            return res.status(200).json({
                status: 'success',
                message: 'test'
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }

    }

    async softDeleteCategory(req, res, next) {
    }

    async removeCategory(req, res, next) {
    }
}

module.exports = new CategoryController();
