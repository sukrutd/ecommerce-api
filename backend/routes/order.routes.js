const express = require('express');
const orderController = require('../controllers/order.controller');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/orders').post(isAuthenticatedUser, orderController.createNewOrder);

router.route('/orders/me').get(isAuthenticatedUser, orderController.getMyOrders);

router.route('/orders/:id').get(isAuthenticatedUser, orderController.getSingleOrder);

router
	.route('/admin/orders')
	.get(isAuthenticatedUser, authorizeRoles('admin'), orderController.getAllOrders);

router
	.route('/admin/orders/:id')
	.put(isAuthenticatedUser, authorizeRoles('admin'), orderController.updateOrderStatus)
	.delete(isAuthenticatedUser, authorizeRoles('admin'), orderController.deleteOrder);

module.exports = router;
