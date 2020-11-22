import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

export default function NewPassword() {
	const [password, setPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const history = useHistory();
	const params = useParams();


	const resetPassword = (event) => {
		event.preventDefault();
		if (!params.token) {
			setErrorMessage('This is a invalid reset password link!');
			return;
		}

		if (!password || !repeatPassword) {
			setErrorMessage('Please fill in all of the fields!');
			return;
		}

		if (password !== repeatPassword) {
			setErrorMessage('Please input the same password in both fields!');
			return;
		}

		if (password.length < 8) {
			setErrorMessage('The password needs to be at least 8 characters!');
			return;
		}

		const headers = new Headers();
		headers.append('Authorization', `Bearer ${params.token}`)

		fetch('http://localhost:8082/auth/new-password', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				password,
			}),
		}).then((response) => response.json())
			.then((content) => {
				if (content.error) {
					setErrorMessage(content.errorMessage);
					return;
				}

				if (content.success) {
					history.push('/login');
				}
			});

		setPassword('');
		setRepeatPassword('');
	}

	return (
		<div>
			<form className="form-container" onSubmit={(event) => resetPassword(event)}>
				<h1>Reset Password</h1>

				{errorMessage ? <div className="error">{errorMessage}</div> : ''}

				<div className="form-contents">
					<label>
						<input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} />
					</label>

					<label>
						<input type="password" placeholder="Repeat new password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} />
					</label>

					<button type="submit">Reset password</button>
				</div>
			</form>
		</div>
	);
}
