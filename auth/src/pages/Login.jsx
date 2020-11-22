import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export default function Login({ onUserAuth, accessToken }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	let history = useHistory();

	useEffect(() => {
		if (accessToken) {
			history.push('/my-account');
		}
	})

	const authenticateUser = (event) => {
		event.preventDefault();
		if (!username || !password) {
			setErrorMessage('Please fill in all of the fields!');
			return;
		}

		fetch('http://localhost:8082/auth/login', {
			method: 'POST',
			body: JSON.stringify({
				username,
				password,
			}),
		}).then((response) => response.json())
			.then((content) => {
				if (content.error) {
					setErrorMessage(content.errorMessage);
					return;
				}

				if (content.success) {
					onUserAuth({ accessToken: content.accessToken, userId: content.userId});
					history.push('/my-account');
				}
			});

		setUsername('');
		setPassword('');
	}

	return (
		<div>
			<form className="form-container" onSubmit={(event) => authenticateUser(event)}>
				<h1>Login</h1>

				{errorMessage ? <div className="error">{errorMessage}</div> : ''}

				<div className="form-contents">
					<label>
						<input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
					</label>

					<label>
						<input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
					</label>

					<p className="help-text">Don't have an account? Sign up <a href="/sign-up">here</a>. Forgot your password? Reset it <a href="/reset-password">here</a>.</p>

					<button type="submit">Login</button>
				</div>
			</form>
		</div>
	);
}
