exports.getReshapingOptions = (properties) => {
	return {
		virtuals: true,
		versionKey: false,
		transform: function (doc, ret) {
			if (Array.isArray(properties) && properties.length > 0) {
				properties.forEach((key) => delete ret[key]);
			} else {
				delete ret._id;
			}
			return ret;
		}
	};
};
