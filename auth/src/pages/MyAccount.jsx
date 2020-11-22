import { useEffect, useState } from "react";
import { useHistory } from "react-router";

export default function MyAccount({ accessToken, userId }) {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');

	const history = useHistory();

	useEffect(() => {
		if (!accessToken) {
			history.push('/login');
			return;
		}

		const headers = new Headers();
		headers.append('Authorization', `Bearer ${accessToken}`);

		fetch(`http://localhost:8082/user/${userId}`, {
			method: 'GET',
			headers,
		}).then((response) => response.json())
			.then((content) => {
				setFirstName(content.first_name);
				setLastName(content.last_name);
				setUsername(content.username);
				setEmail(content.email);
			});
	});

	return (
		<>
			{
				accessToken ?
					(
					<div>
						<h1>MyAccount</h1>
						<div>First name: {firstName}</div>
						<div>Last name: {lastName}</div>
						<div>Username: {username}</div>
						<div>Email: {email}</div>
					</div>
					)
				:
					''
			}
		</>
	);
}
