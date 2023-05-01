const app = require('./app');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/database');

// Handler for Uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log('Shutting down the server due to uncaught exception.');
	process.exit(1);
});

// Load Environment variables
dotenv.config({ path: 'backend/config/config.env' });

connectToDatabase();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// Handler for Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
	console.log(`Error: ${err.message}`);
	console.log('Shutting down the server due to unhandled promise rejection');
	server.close(() => {
		process.exit(1);
	});
});
