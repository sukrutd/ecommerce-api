const express = require('express');
const productController = require('../controllers/product.controller');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/products').get(productController.getAllProducts);

router.route('/products/:id').get(productController.getProductDetails);

router
	.route('/admin/products')
	.post(isAuthenticatedUser, authorizeRoles('admin'), productController.createProduct);

router
	.route('/admin/products/:id')
	.put(isAuthenticatedUser, authorizeRoles('admin'), productController.updateProduct)
	.delete(isAuthenticatedUser, authorizeRoles('admin'), productController.deleteProduct);

router.route('/review').put(isAuthenticatedUser, productController.createProductReview);

router
	.route('/reviews')
	.get(productController.getProductReviews)
	.delete(isAuthenticatedUser, authorizeRoles('admin'), productController.deleteProductReview);

module.exports = router;
