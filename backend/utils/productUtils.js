const Product = require('../models/product.model');

exports.getProductRating = (reviews = []) =>
	reviews.reduce((result, currentReview) => result + currentReview.rating, 0) / reviews.length;

exports.updateStock = async (productId, quantity) => {
	const product = await Product.findById(productId);
	product.stock -= quantity;
	return await product.save({ validateBeforeSave: false });
};
