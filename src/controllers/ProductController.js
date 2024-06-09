const ProductModel = require("../models/ProductModel"); // Assuming the schema is in a file named ProductModel.js

const fs = require("fs")
const {decodeToken} = require("../utils/token");

class ProductController {
    constructor() {
        this.handleGetProduct = this.handleGetProduct.bind(this);
        this.getProductById = this.getProductById.bind(this);
    }

    async handleGetProduct(req, res, next) {

        const {filter, min, max, isFull} = req.query;

        console.log();

        let filterOptions = {}

        if (!isFull) {
            filterOptions.isActive = true;
        }

        if (filter && filter !== "all") {
            filterOptions.productCategory = filter;
        }

        if (min && max) {
            filterOptions.productPrice = {$gte: min, $lte: max}
        }

        const listProducts = await ProductModel.find(filterOptions);

        return res.status(200).json({
            status: 'success',
            message: 'Successfully get list products',
            data: listProducts
        })

        // const {_s, filter} = req.query;
        //
        // if (_s) {
        //     await this.getProductsBySearchKey(_s, res);
        // } else if (filter) {
        //     await this.getProductsByFilter(filter, res);
        // } else {
        //     await this.getAllProducts(res);
        // }
    }

    async getAllProducts(res) {

        const listProductData = await ProductModel.find({});

        return res.status(200).json({
            status: "success get",
            data: listProductData,
        });
    }

    async getProductsByFilter(filter, res) {
        const listProduct = await ProductModel.find({
            productCategory: filter
        })

        if (listProduct) {
            return res.status(200).json({
                status: "success",
                message: "",
                data: listProduct
            })
        } else {
            return res.status(200).json({
                status: "success",
                message: `Cant find any products in ${filter} category`,
                data: listProduct
            })
        }

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
    async getProductById(req, res, next) {
        const {productId} = req.params

        if (!productId) {
            return this.getAllProducts();
        }

        try {
            const productDetails = await ProductModel.findById(productId)

            return res.status(200).json({
                status: "success",
                message: "",
                data: productDetails
            })
        } catch (err) {

            if (err.name === "CastError") {
                return res.status(400).json({
                    status: "failure",
                    message: "Invalid productId"
                })
            }
        }
    }

    async getProductColors(req, res, next) {
        const productData = await ProductModel.find({});

        const listColors = [...new Set(productData.map((item) => item.productColor))]

        return res.status(200).json({
            status: 'success',
            message: "",
            data: listColors
        })

    }

    async createNewProduct(req, res, next) {
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

            const {
                productName,
                productImage,
                productPrice,
                isDiscount,
                discountPercents,
                productStock,
                productCategory,
                isActive
            } = req.body;

            const checkRequired = [
                !productName && "productName",
                !productImage && "productImage",
                !productPrice && "productPrice",
                isDiscount === undefined && "isDiscount",
                isDiscount && !discountPercents && "discountPercents",
                !productStock && "productStock",
                !productCategory && "productCategory",

            ].filter((item) => item);

            if (checkRequired.length > 0) {
                return res.status(404).json({
                    status: "failure",
                    message: "Missing some required fields, please fill all required fields before submitting",
                    missingFields: checkRequired,
                });
            }

            const imageDirectory = './public/images/';

            let parseImageExt = productImage.split(';')[0].split('/')[1];

            const imageExt = parseImageExt === "jpeg" ? "jpg" : parseImageExt;
            const fileName = Date.now() + '.' + imageExt;

            const base64data = productImage.replace(/^data:.*,/, '');

            fs.writeFile(imageDirectory + fileName, base64data, 'base64', (err) => {
                if (err) {
                    console.log(err);
                    res.json({
                        status: 'error',
                        message: err.name
                    })
                }
            });

            const newProduct = new ProductModel({
                productName,
                productPrice,
                isDiscount,
                discountPercents,
                productStock,
                productImage: `/images/${fileName}`,
                productCategory,
                isActive
            });

            await newProduct.save();

            return res.status(201).json({
                status: "success",
                message: 'Successfully created new product'
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

    async editProduct(req, res, next) {
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

            const {
                productId,
                productName,
                productImage,
                productPrice,
                isDiscount,
                discountPercents,
                productStock,
                productCategory,
                isActive
            } = req.body;

            const checkRequired = [
                !productName && "productName",
                !productPrice && "productPrice",
                isDiscount === undefined && "isDiscount",
                isDiscount && !discountPercents && "discountPercents",
                !productStock && "productStock",
                !productCategory && "productCategory",

            ].filter((item) => item);

            if (checkRequired.length > 0) {
                return res.status(404).json({
                    status: "failure",
                    message: "Missing some required fields, please fill all required fields before submitting",
                    missingFields: checkRequired,
                });
            }

            let fileName = '';
            if (productImage) {
                const imageDirectory = './public/images/';

                let parseImageExt = productImage.split(';')[0].split('/')[1];

                const imageExt = parseImageExt === "jpeg" ? "jpg" : parseImageExt;
                fileName = Date.now() + '.' + imageExt;

                const base64data = productImage.replace(/^data:.*,/, '');

                fs.writeFile(imageDirectory + fileName, base64data, 'base64', (err) => {
                    if (err) {
                        console.log(err);
                        res.json({
                            status: 'error',
                            message: err.name
                        })
                    }
                });
            }

            let updateData = {
                productName,
                productPrice,
                isDiscount,
                discountPercents,
                productStock,
                productCategory,
                isActive
            }

            if (productImage) {
                updateData = {
                    ...updateData,
                    productImage: `/images/${fileName}`,
                }
            }

            await ProductModel.findByIdAndUpdate(productId, updateData);

            return res.status(201).json({
                status: "success",
                message: 'Successfully edited product details'
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

    async deactivateProduct(req, res, next) {
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

            const {productId} = req.body;

            await ProductModel.findByIdAndUpdate(productId, {
                isActive: 0
            })

            return res.status(200).json({
                status: "success",
                message: "Product deactivated successfully"
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

    async reactivateProduct(req, res, next) {
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

            const {productId} = req.body;

            await ProductModel.findByIdAndUpdate(productId, {
                isActive: 1
            })

            return res.status(200).json({
                status: "success",
                message: "Product reactivated successfully"
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

    async removeProduct(req, res, next) {
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

            const {productId} = req.params;

            await ProductModel.findByIdAndDelete(productId);

            return res.status(200).json({
                status: "success",
                message: "Product deleted successfully"
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

    async handleChangeProductCategory(productId, newCategoryName) {
        const productData = await ProductModel.findById(productId);

        if (!productData) {
            return false;
        }

        productData.productCategory = newCategoryName;
        await productData.save();
        return true;
    }

    async getNewArrivals(req, res, next) {
        try {
            const newArrivalsProduct = await ProductModel.find({
                isActive: true
            }).sort({'createdAt': -1}).limit(4);
            return res.status(200).json({
                status: 'success',
                message: 'Successfully get new arrival products',
                data: newArrivalsProduct
            })
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async getTopSell(req, res, next) {
        try {
            const topSells = await ProductModel.find({
                isActive: true
            }).sort({'soldCount': -1}).limit(4);
            return res.status(200).json({
                status: 'success',
                message: 'Successfully get new arrival products',
                data: topSells
            })
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async increaseProductView(req, res, next) {
        try {
            const {productId} = req.params;

            await ProductModel.findByIdAndUpdate(productId, {
                    $inc: {
                        views: 1,
                    }
                }
            )

            return res.status(200).json({
                status: 'success'
            })
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }
}

module.exports = new ProductController();
