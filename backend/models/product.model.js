const mongoose = require('mongoose');
const { getReshapingOptions } = require('../utils/miscellaneous');

const reshapingOptions = getReshapingOptions();

const productImageSubSchema = mongoose.Schema(
	{
		public_id: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		}
	},
	{ toJSON: reshapingOptions }
);

const productReviewSubSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		name: {
			type: String,
			required: true
		},
		rating: {
			type: Number,
			required: true
		},
		comment: {
			type: String,
			required: true
		}
	},
	{ toJSON: reshapingOptions }
);

const productSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please enter product name.'],
			trim: true
		},
		description: {
			type: String,
			required: [true, 'Please enter product description.']
		},
		price: {
			type: Number,
			required: [true, 'Please enter product price.'],
			maxLength: [8, 'Price cannot exceed 8 characters.']
		},
		rating: {
			type: Number,
			default: 0
		},
		images: [productImageSubSchema],
		category: {
			type: String,
			required: [true, 'Please enter product category.']
		},
		stock: {
			type: Number,
			required: [true, 'Please enter product stock.'],
			maxLength: [5, 'Stock cannot exceed 5 characters.'],
			default: 1
		},
		numOfReviews: {
			type: Number,
			default: 0
		},
		reviews: [productReviewSubSchema],
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		createdAt: {
			type: Date,
			default: Date.now
		}
	},
	{ toJSON: reshapingOptions }
);

module.exports = mongoose.model('Product', productSchema);
