import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom';
import Home from "../pages/Home";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import MyAccount from "../pages/MyAccount";

function App() {
  const [accessToken, setAccessToken] = useState(undefined);
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      setAccessToken(localStorage.getItem('accessToken'));
    }

    if (localStorage.getItem('userId')) {
      setUserId(localStorage.getItem('userId'));
    }
  });

  const logout = () => {
    setAccessToken(undefined);
    setUserId(undefined);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
  }

  const handleUserAuth = ({accessToken, userId}) => {
    setAccessToken(accessToken);
    setUserId(userId);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userId', userId);
  }

  return (
    <Router>
      <div className='App'>
        <nav>
          <Link to="/" className="nav-link">Home</Link>
          {accessToken ? <Link to="/my-account">My Account</Link> : ''}

          <div className='right-container'>
            {!accessToken ? <Link to="/login" className='nav-link'>Login</Link> : ''}
            {!accessToken ? <Link to="/sign-up" className='nav-link'>Sign up</Link> : ''}
            {accessToken ? <button onClick={logout}><a href="/">Logout</a></button> : ''}
          </div>
        </nav>

        <Switch>
          <Route path="/my-account" component={() => <MyAccount accessToken={accessToken} userId={userId}/>} />
          <Route path="/login" component={() => <Login onUserAuth={(userObject) => handleUserAuth(userObject)} accessToken={accessToken} />} />
          <Route path="/sign-up" component={() => <Signup accessToken={accessToken} />} />
          <Route exact path="/" component={() => <Home />} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
