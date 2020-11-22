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
			await sendEmail(user.email, results.insertId);
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


async function hashPassword(password) {
	return await bcrypt.hash(password, saltRounds);
}

async function verifyUser(password, hash) {
	return await bcrypt.compare(password, hash);
}

async function sendEmail(emailTo, userId) {
	let testAccount = await nodemailer.createTestAccount();

	let transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass,
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: 'Auth system 🔑<auth@system.com>', // sender address
		to: `${emailTo}`, // list of receivers
		subject: "Verify your email address ✅", // Subject line
		html: `<b>Your email address was used to signup to our service. Please verify the address by clicking <a href="http://localhost:8082/auth/verify/${userId}">here</a>.</b>`, // html body
	});

	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = router;
