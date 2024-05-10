class AdminController {
	async handleGetProduct(res, req, next) {}

	async getAllProducts(res, req, next) {}

	async getProductsBySearchKey(res, req, next) {}

	// async getProductsByCategory(res, req, next) {}0
	async getProductById(res, req, next) {}

	async createNewProduct(res, req, next) {}

	async handlePutProduct(res, req, next) {}

	async editProduct(res, req, next) {}

	async softDeleteProduct(res, req, next) {}

	async removeProduct(res, req, next) {}
}

module.exports = new AdminController();
