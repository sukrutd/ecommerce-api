const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { getReshapingOptions } = require('../utils/miscellaneous');

const reshapingOptions = getReshapingOptions([
	'_id',
	'password',
	'resetPasswordToken',
	'resetPasswordExpiry'
]);

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please enter your name.'],
			maxLength: [30, 'Name cannot exceed 30 characters.'],
			minLength: [3, 'Name must be at least 3 characters long.']
		},
		email: {
			type: String,
			unique: true,
			required: [true, 'Please enter your email address.'],
			validate: [validator.isEmail, 'Please enter a valid email address.']
		},
		password: {
			type: String,
			required: [true, 'Please enter your password.'],
			minLength: [8, 'Password must be at least 8 characters long.'],
			select: false
		},
		avatar: {
			public_id: {
				type: String,
				required: true
			},
			url: {
				type: String,
				required: true
			}
		},
		role: {
			type: String,
			default: 'user'
		},
		resetPasswordToken: String,
		resetPasswordExpiry: Date
	},
	{ toJSON: reshapingOptions }
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) next();

	this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getSignedJWT = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRY
	});
};

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
	// Generating reset token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hashing and adding resetPasswordToken to userSchema
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	// Setting resetPasswordExpiry to 15 mins
	this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model('User', userSchema);
