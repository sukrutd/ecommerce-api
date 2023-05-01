const Order = require('../models/order.model');
const Product = require('../models/product.model');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { updateStock } = require('../utils/productUtils');

// Create new order
exports.createNewOrder = catchAsyncErrors(async (req, res, next) => {
	const {
		shippingInfo,
		orderItems,
		paymentInfo,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice
	} = req.body;

	const order = await Order.create({
		shippingInfo,
		orderItems,
		paymentInfo,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		paidAt: Date.now(),
		user: req.user.id
	});

	return res.status(200).json({ success: true, order });
});

// Get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate('user', 'name email');

	if (!order) return next(new ErrorHandler('Order not found.', 404));

	return res.status(200).json({ success: true, order });
});

// Get logged-in user's orders
exports.getMyOrders = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find({ user: req.user.id });

	return res.status(200).json({ success: true, orders });
});

// Get all orders -Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find();

	let totalAmount = orders.reduce((result, currentOrder) => result + currentOrder.totalPrice, 0);

	return res.status(200).json({ success: true, totalAmount, orders });
});

// Update order status -Admin
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		return next(new ErrorHandler('Order not found.', 404));
	}

	if (order.orderStatus === 'Delivered') {
		return next(new ErrorHandler('The order has already been delivered.', 400));
	}

	const status = req.body.status;
	order.orderStatus = status;

	if (status === 'Shipped') {
		const stockUpdates = [];
		order.orderItems.forEach(({ product, quantity }) =>
			stockUpdates.push(updateStock(product, quantity))
		);
		await Promise.all(stockUpdates);
	}

	if (status === 'Delivered') {
		order.deliveredAt = Date.now();
	}

	await order.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json({ success: true, message: 'The order status has been updated successfully.' });
});

// Delete order -Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) return next(new ErrorHandler('Order not found.', 404));

	if (order.orderStatus === 'Delivered') {
		return next(
			new ErrorHandler('The order cannot be removed, it has already been delivered.', 400)
		);
	}

	await order.remove();

	return res
		.status(200)
		.json({ success: true, message: 'The order has been removed successfully.' });
});
