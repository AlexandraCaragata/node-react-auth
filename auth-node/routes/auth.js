const router = require('express').Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const connection = require('../database');

const saltRounds = 10;

router.post('/auth/sign-up', async (req, res) => {
	const user = req.body;
	const hash = await hashPassword(user.password);

	connection.query(
		'INSERT INTO users SET ?',
		{ id: null, first_name: user.firstName, last_name: user.lastName, username: user.username, email: user.email, hash, verified: 0 },
		async function (error, results, fields) {
		if (error) {
			console.log(error);
			return res.status(500).send({ error: true, errorMessage: 'Could not create a new user!' });
		}

		try {
			await sendEmailToVerifyUser(user.email, results.insertId);
		} catch (e) {
			console.log(e);
			return res.status(500).send({ error: true, errorMessage: 'Could not send a verification email!' });
		}

		return res.status(200).send({ success: true, userId: results.insertId });
	});
});

router.get('/auth/verify/:id', async (req, res) => {
	const id = parseInt(req.params.id, 10);

	connection.query(
		'UPDATE users SET verified = ? WHERE id = ?',
		[1, id],
		async function (error, results, fields) {
			if (error) {
				console.log(error);
				return res.status(500).send({ error: true, errorMessage: 'Could not validate user!' });
			}

			return res.redirect('http://localhost:3000/login');
		});
});

router.post('/auth/login', async (req, res) => {
	const { username, password } = req.body;

	connection.query(
		'SELECT id, hash FROM users WHERE username = ?',
		username,
		async function (error, results, fields) {
			if (error) {
				console.log(error);
				return res.status(500).send({ error: true, errorMessage: 'Something went wrong!' });
			}

			if (!results.length) {
				return res.status(401).send({ error: true, errorMessage: 'Invalid credentials!' });
			}

			const hash = results[0].hash;
			const isAuthenticated = await verifyUser(password, hash);

			if (!isAuthenticated) {
				return res.status(401).send({ error: true, errorMessage: 'Invalid credentials!' });
			}

			if (isAuthenticated) {
				const accessToken = jwt.sign({ id: results[0].id, name: username }, process.env.ACCESS_SECRET_TOKEN);
				return res.status(200).send({ success: true, accessToken, userId: results[0].id });
			}
		});
});

router.post('/auth/reset-password', async (req, res) => {
	const { username, email } = req.body;

	connection.query(
		'SELECT id FROM users WHERE username = ? AND email = ?',
		[username, email],
		async function (error, results, fields) {
			if (error) {
				console.log(error);
				return res.status(500).send({ error: true, errorMessage: 'Something went wrong!' });
			}

			if (!results.length) {
				return res.status(401).send({ error: true, errorMessage: 'Invalid credentials!' });
			}

			const token = jwt.sign({ userId: results[0].id }, process.env.ACCESS_RESET_PASSWORD_SECRET_TOKEN);

			try {
				await sendEmailToResetPassword(email, token);
			} catch (e) {
				console.log(e);
				return res.status(500).send({ error: true, errorMessage: 'Could not send a password reset email!' });
			}

			return res.status(200).send({ success: true, successMessage: 'Please verify your email to reset the password' });
		});
});

router.post('/auth/new-password', authenticateToken, async (req, res) => {
	const { userId } = req;
	const { password } = req.body;
	const hash = await hashPassword(password);

	connection.query(
		'UPDATE users SET hash = ? WHERE id = ?',
		[hash, userId],
		async function (error, results, fields) {
			if (error) {
				console.log(error);
				return res.status(500).send({ error: true, errorMessage: 'Something went wrong!' });
			}

			return res.status(200).send({ success: true });
		});
});


async function hashPassword(password) {
	return await bcrypt.hash(password, saltRounds);
}

async function verifyUser(password, hash) {
	return await bcrypt.compare(password, hash);
}

async function getEmailTransporter() {
	let testAccount = await nodemailer.createTestAccount();

	return nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass,
		},
	});
}

async function sendEmailToVerifyUser(emailTo, userId) {
	const transporter = await getEmailTransporter();

	let info = await transporter.sendMail({
		from: 'Auth system 🔑<auth@system.com>', // sender address
		to: `${emailTo}`, // list of receivers
		subject: "Verify your email address ✅", // Subject line
		html: `<b>Your email address was used to signup to our service. Please verify the address by clicking <a href="http://localhost:8082/auth/verify/${userId}">here</a>.</b>`, // html body
	});

	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

async function sendEmailToResetPassword(emailTo, token) {
	const transporter = await getEmailTransporter();

		let info = await transporter.sendMail({
			from: 'Auth system 🔑<auth@system.com>', // sender address
			to: `${emailTo}`, // list of receivers
			subject: "Reset password ✅", // Subject line
			html: `<b>You have submitted a request to reset your password. Reset the password by clicking <a href="http://localhost:3000/new-password/${token}">here</a>.</b>`, // html body
		});


	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

async function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	jwt.verify(token, process.env["ACCESS_RESET_PASSWORD_SECRET_TOKEN"], (err, result) => {
		if (err) {
			return res.status(403);
		}

		req.userId = result.id;
		next();
	});
}

module.exports = router;
