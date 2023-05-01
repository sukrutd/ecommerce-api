const Product = require('../models/product.model');
const ApiFeatures = require('../utils/ApiFeatures');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { getProductRating } = require('../utils/productUtils');

// Create new product - Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
	req.body.user = req.user.id;
	const product = await Product.create(req.body);
	return res.status(201).json({ success: true, product });
});

// Get all products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
	const resultsPerPage = 5;
	const productCount = await Product.countDocuments();

	const apiFeatures = new ApiFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resultsPerPage);

	const products = await apiFeatures.query;
	return res.status(200).json({ success: true, products, productCount });
});

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
	let product = await Product.findById(req.params.id);

	if (!product) return next(new ErrorHandler('Product not found.', 404));

	return res.status(200).json({ success: true, product });
});

// Update product - Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
	let product = await Product.findById(req.params.id);

	if (!product) return next(new ErrorHandler('Product not found.', 404));

	product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	return res.status(200).json({ success: true, product });
});

// Delete product - Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
	let product = await Product.findById(req.params.id);

	if (!product) return next(new ErrorHandler('Product not found.', 404));

	await product.remove();

	return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
});

// Create a new Review or update Review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
	const { rating, comment, productId } = req.body;
	const review = {
		user: req.user.id,
		name: req.user.name,
		rating: Number(rating),
		comment
	};

	const product = await Product.findById(productId);

	if (!product) return next(new ErrorHandler('Product not found.', 404));

	const isReviewed = product.reviews.find(
		(rev) => rev.user.toString() === req.user.id.toString()
	);

	if (isReviewed) {
		product.reviews.forEach((rev) => {
			if (rev.user.toString() === req.user.id.toString()) {
				rev.rating = rating;
				rev.comment = comment;
			}
		});
	} else {
		product.reviews.push(review);
		product.numOfReviews = product.reviews.length;
	}

	product.rating = getProductRating(product.reviews);
	await product.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json({ success: true, message: 'The review has been saved successfully.' });
});

// Get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);

	if (!product) return next(new ErrorHandler('Product not found.', 404));

	return res.status(200).json({ success: true, reviews: product.reviews });
});

// Delete a particular review
exports.deleteProductReview = catchAsyncErrors(async (req, res, next) => {
	const productId = req.query.productId;
	const product = await Product.findById(productId);

	if (!product) return next(new ErrorHandler('Product not found.', 404));

	const reviews = product.reviews.filter((rev) => rev.id.toString() !== req.query.id.toString());
	const rating = getProductRating(reviews);
	const numOfReviews = reviews.length;

	await Product.findByIdAndUpdate(
		productId,
		{ reviews, rating, numOfReviews },
		{
			new: true,
			runValidators: true
		}
	);

	return res
		.status(200)
		.json({ success: true, message: 'The review has been deleted successfully.' });
});
