const mongoose = require('mongoose');
const { getReshapingOptions } = require('../utils/miscellaneous');

const reshapingOptions = getReshapingOptions();

const orderItemSubSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true
		},
		quantity: {
			type: Number,
			required: true
		},
		image: {
			type: String,
			required: true
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
			required: true
		}
	},
	{ toJSON: reshapingOptions }
);

const orderSchema = mongoose.Schema(
	{
		shippingInfo: {
			address: {
				type: String,
				required: true
			},
			city: {
				type: String,
				required: true
			},
			state: {
				type: String,
				required: true
			},
			country: {
				type: String,
				required: true
			},
			postalCode: {
				type: String,
				required: true
			},
			phone: {
				type: String,
				required: true
			}
		},
		orderItems: [orderItemSubSchema],
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		paymentInfo: {
			id: {
				type: String,
				required: true
			},
			status: {
				type: String,
				required: true
			}
		},
		paidAt: {
			type: Date,
			required: true
		},
		itemsPrice: {
			type: Number,
			required: true,
			default: 0
		},
		taxPrice: {
			type: Number,
			required: true,
			default: 0
		},
		shippingPrice: {
			type: Number,
			required: true,
			default: 0
		},
		totalPrice: {
			type: Number,
			required: true,
			default: 0
		},
		orderStatus: {
			type: String,
			required: true,
			default: 'Processing'
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
		deliveredAt: Date
	},
	{ toJSON: reshapingOptions }
);

module.exports = mongoose.model('Order', orderSchema);
