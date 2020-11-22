import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom';
import Home from "../pages/Home";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import MyAccount from "../pages/MyAccount";

function App() {
  const [accessToken, setAccessToken] = useState(undefined);

  const logout = () => {
    setAccessToken(undefined);
    localStorage.removeItem('accessToken');
  }

  const handleUserAuth = (token) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
  }

  return (
    <Router>
      <div className='App'>
        <nav>
          <Link to="/" className="nav-link">Home</Link>
          {accessToken ? <Link to="/my-account">My Account</Link> : ''}

          <div className='right-container'>
            <Link to="/login" className='nav-link'>Login</Link>
            <Link to="/sign-up" className='nav-link'>Sign up</Link>
            {accessToken ? <button onClick={logout}><a href="/">Logout</a></button> : ''}
          </div>
        </nav>

        <Switch>
          {accessToken ? <Route path="/my-account" component={() => <MyAccount />} /> : ''}
          <Route path="/login" component={() => <Login onUserAuth={(token) => handleUserAuth(token)} />} />
          <Route path="/sign-up" component={() => <Signup />} />
          <Route exact path="/" component={() => <Home />} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
