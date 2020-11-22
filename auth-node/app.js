require('dotenv').config();

const express = require('express');
const app = express();
const rateLimiter = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const connection = require('./database');


app.use(express.json({ type: ['application/json', 'text/plain'] }));
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, authorization, Content-Type, Accept');
	next();
});
app.use(authRoutes);

app.use('/auth', rateLimiter({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 5 // limit each IP to 5 requests per windowMs
}));

app.get('/user/:id', authenticateToken, (req, res) => {
	const userId = parseInt(req.params.id, 10);

	if (userId !== req.user.id) {
		return res.status(401);
	}

	connection.query(
		'SELECT first_name, last_name, username, email FROM users WHERE id = ?',
		userId,
		async function (error, results, fields) {
			if (error) {
				console.log(error);
				return res.status(500).send({ error: true, errorMessage: 'Something went wrong!' });
			}

			if (!results.length) {
				return res.status(401).send({ error: true, errorMessage: 'Could not find user!' });
			}

			return res.status(200).send(results[0]);
		});
});

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

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
