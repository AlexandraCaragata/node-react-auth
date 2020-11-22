import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";


export default function Signup({ accessToken }) {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const history = useHistory();

	useEffect(() => {
		if (accessToken) {
			history.push('/my-account');
		}
	})

	const signUpUser = (event) => {
		event.preventDefault();
		if (!firstName || !lastName || !username || !password || !email) {
			setErrorMessage('Please fill in all of the fields!');
			return;
		}

		if (!email.match(/@/)) {
			setErrorMessage('Please enter a valid email address!');
			return;
		}

		if (password.length < 8) {
			setErrorMessage('Password needs to be at least 8 characters!');
			return;
		}

		fetch('http://localhost:8082/auth/sign-up', {
			method: 'POST',
			body: JSON.stringify({
				firstName,
				lastName,
				username,
				email,
				password,
			}),
		}).then((response) => response.json())
			.then((content) => {
				if (content.success) {
					setSuccessMessage('User was successfully created! Check your mail to validate yourself!');
				}

				if (content.error) {
					setErrorMessage(content.errorMessage);
				}
			});

		setFirstName('');
		setLastName('');
		setUsername('');
		setEmail('');
		setPassword('');
	}

	return (
		<div>
			<form className="form-container" onSubmit={(event) => signUpUser(event)}>
				<h1>Signup</h1>

				{errorMessage ? <div className="error">{errorMessage}</div> : ''}
				{successMessage ? <div className="success">{successMessage}</div> : ''}

				<div className="form-contents">
					<label>
						<input
							type="text"
							placeholder="First name"
							value={firstName}
							onChange={(event) => { setFirstName(event.target.value) }}
						/>
					</label>

					<label>
						<input
							type="text"
							placeholder="Last name"
							value={lastName}
							onChange={(event) => { setLastName(event.target.value) }}
						/>
					</label>

					<label>
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(event) => { setUsername(event.target.value) }}
						/>
					</label>

					<label>
						<input
							type="text"
							placeholder="Email"
							value={email}
							onChange={(event) => { setEmail(event.target.value) }}
						/>
					</label>

					<label>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(event) => { setPassword(event.target.value) }}
						/>
						<p className="help-text">The password needs to be a minimum of 8 characters</p>
					</label>

					<button type="submit">Signup</button>
				</div>
			</form>
		</div>
	);
}
