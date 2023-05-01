const User = require('../models/user.model');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/sendToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register New User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
	const { name, email, password } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		avatar: {
			public_id: 'sampleId',
			url: 'profilePhotoUrl'
		}
	});

	sendToken(user, res, 201);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return next(new ErrorHandler('Please enter your email address and password.', 400));
	}

	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		return next(new ErrorHandler('Invalid email address or password.', 401));
	}

	const isPasswordMatched = await user.comparePassword(password);
	if (!isPasswordMatched) {
		return next(new ErrorHandler('Invalid email address or password.', 401));
	}

	sendToken(user, res, 200);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
	res.cookie('token', null, { httpOnly: true, expires: new Date(Date.now()) });
	return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// Forgot Password - Send Email with Password Reset Link
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(
			new ErrorHandler('There is no user account associated with this email address.', 404)
		);
	}

	const resetToken = user.getResetPasswordToken();
	await user.save({ validateBeforeSave: false });

	const baseUrl = `${req.protocol}://${req.get('host')}`;
	const resetPasswordUrl = `${baseUrl}/api/v1/password/reset/${resetToken}`;

	const message = `Hello,\n\nWe have received a request to reset the password for the account associated with ${user.email}. You can reset your password by clicking the link below:\n\n${resetPasswordUrl}.\n\nIf you did not request a password reset, you can safely ignore this email. Only a person with access to your email can reset your account password.\n\nRegards,\nTeam Ecommerce`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Ecommerce - Password Recovery',
			message
		});

		return res.status(200).json({
			success: true,
			message: `An email with instructions to reset your password has been sent to ${user.email}.`
		});
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiry = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new ErrorHandler(error.message, 500));
	}
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
	// Creating Token Hash
	const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpiry: { $gt: Date.now() }
	});

	if (!user) {
		return next(new ErrorHandler('The reset password link is either invalid or expired.', 400));
	}

	const enteredPassword = req.body.password;
	const confirmPassword = req.body.confirmPassword;

	if (enteredPassword !== confirmPassword) {
		return next(new ErrorHandler('Passwords do not match.', 400));
	}

	user.password = enteredPassword;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpiry = undefined;

	await user.save();

	sendToken(user, res, 200);
});

// Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	return res.status(200).json({ success: true, user });
});

// Update Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	const { oldPassword, newPassword, confirmPassword } = req.body;

	const isPasswordMatched = await user.comparePassword(oldPassword);

	if (!isPasswordMatched) {
		return next(new ErrorHandler('Old password is incorrect.', 400));
	}

	if (newPassword !== confirmPassword) {
		return next(new ErrorHandler('Passwords do not match.', 400));
	}

	user.password = newPassword;

	await user.save();

	sendToken(user, res, 200);
});

// Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
	const newUserInfo = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findByIdAndUpdate(req.user.id, newUserInfo, {
		new: true,
		runValidators: true
	});

	return res
		.status(200)
		.json({ success: true, message: 'The profile has been updated successfully.' });
});

// Get All Users - Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find();
	return res.status(200).json({ success: true, users });
});

// Get Single User - Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new ErrorHandler('User not found.', 404));
	}

	return res.status(200).json({ success: true, user });
});

// Update User Role - Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new ErrorHandler('User not found.', 404));
	}

	user.role = req.body.role;

	await user.save();

	return res
		.status(200)
		.json({ success: true, message: 'The user role has been updated successfully.' });
});

// Delete User - Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new ErrorHandler('User not found.', 404));
	}

	await user.remove();

	return res
		.status(200)
		.json({ success: true, message: 'The user has been deleted successfully.' });
});
