const sendToken = (user, response, statusCode) => {
	const token = user.getSignedJWT();

	// Options for a Cookie
	const options = {
		httpOnly: true,
		expires: new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000)
	};

	return response.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
		user
	});
};

module.exports = sendToken;
