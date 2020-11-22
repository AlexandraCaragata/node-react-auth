import { useEffect, useState } from "react";
import { useHistory } from "react-router";

export default function Content({ accessToken }) {
	const [content, setContent] = useState('');

	const history = useHistory();

	useEffect(() => {
		if (!accessToken) {
			history.push('/login');
			return;
		}

		const headers = new Headers();
		headers.append('Authorization', `Bearer ${accessToken}`);

		fetch(`http://localhost:8082/content`, {
			method: 'GET',
			headers,
		}).then((response) => response.json())
			.then((content) => {
				setContent(content.content);
			});
	});

	return (
		<>
			{
				accessToken ?
					(
						<div>
							<h1>Content Page</h1>
							<div>{ content }</div>
						</div>
					)
					:
					''
			}
		</>
	);
}
