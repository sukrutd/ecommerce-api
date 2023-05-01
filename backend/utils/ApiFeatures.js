class ApiFeatures {
	constructor(query, queryStr) {
		this.query = query;
		this.queryStr = queryStr;
	}

	search() {
		const keyword = this.queryStr.keyword;
		const options = keyword ? { name: { $regex: keyword, $options: 'i' } } : {};
		this.query = this.query.find({ ...options });
		return this;
	}

	filter() {
		const queryObject = { ...this.queryStr };

		// Removing some fields for filtering by category
		const removeFields = ['keyword', 'page', 'limit'];
		removeFields.forEach((key) => delete queryObject[key]);

		// Filter for price and rating
		let queryString = JSON.stringify(queryObject);
		queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

		const filterOptions = JSON.parse(queryString);
		this.query = this.query.find(filterOptions);
		return this;
	}

	pagination(resultsPerPage) {
		const currentPage = Number(this.queryStr.page) || 1;
		const skip = resultsPerPage * (currentPage - 1);
		this.query = this.query.limit(resultsPerPage).skip(skip);
		return this;
	}
}

module.exports = ApiFeatures;
