const ErrorHandler = require('../utils/ErrorHandler');

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.message = err.message || 'Internal Server Error';

	// Handle Mongoose CastError [e.g. Invalid MongoDb Id Error]
	if (err.name === 'CastError') {
		const message = `Resource not found. Invalid ${err.path}`;
		err = new ErrorHandler(message, 400);
	}

	// Handle Mongoose Duplicate Key Error
	if (err.code === 11000) {
		const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
		err = new ErrorHandler(message, 400);
	}

	// Handle Invalid JWT Error
	if (err.name === 'JsonWebTokenError') {
		const message = 'Invalid token, please login to continue.';
		err = new ErrorHandler(message, 400);
	}

	// Handle JWT Expiration Error
	if (err.name === 'TokenExpiredError') {
		const message = 'Token expired, please login to continue.';
		err = new ErrorHandler(message, 400);
	}

	return res.status(err.statusCode).json({ success: false, message: err.message });
};
