import React, { useState } from 'react';

export default function ResetPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetPassword = (event) => {
    event.preventDefault();
    if (!username || !email) {
      setErrorMessage('Please fill in all of the fields!');
      return;
    }

    fetch('http://localhost:8082/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
      }),
    }).then((response) => response.json())
      .then((content) => {
        if (content.error) {
          setErrorMessage(content.errorMessage);
          return;
        }

        if (content.success) {
          setSuccessMessage(content.successMessage);
        }
      });

    setUsername('');
    setEmail('');
  };

  return (
    <div>
      <form className="form-container" onSubmit={(event) => resetPassword(event)}>
        <h1>Reset Password</h1>

        {errorMessage ? <div className="error">{errorMessage}</div> : ''}
        {successMessage ? <div className="success">{successMessage}</div> : ''}

        <div className="form-contents">
          <label>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>

          <label>
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <button type="submit">Send email to reset password</button>
        </div>
      </form>
    </div>
  );
}
