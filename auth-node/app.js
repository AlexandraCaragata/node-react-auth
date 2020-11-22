require('dotenv').config();

const express = require('express');
const app = express();
const rateLimiter = require('express-rate-limit');
const authRoutes = require('./routes/auth');

app.use(express.json({ type: ['application/json', 'text/plain'] }));
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
app.use(authRoutes);

app.use('/auth', rateLimiter({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 5 // limit each IP to 5 requests per windowMs
}));

function authenticateToken(req, res, next) {
	// fetch the token from where it will be,
	const token = '';

	jwt.verify(token, process.env["ACCESS_SECRET_TOKEN"], (err, user) => {
		if (err) {
			return res.status(403);
		}

		req.user = user;
		next();
	});
}

app.listen(8082, (error) => {
	if (error) {
		console.log('Error occurred: ' + error);
	}

	console.log('Server running on port 8082');
});
