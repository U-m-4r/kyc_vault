import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ServiceVerification from './components/ServiceVerfication';
import Login from './components/Login';
import './index.scss';

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Debug: Log state changes
  useEffect(() => {
    console.log("User logged in state:", userLoggedIn);
    console.log("Current user email:", currentUserEmail);
  }, [userLoggedIn, currentUserEmail]);

  const handleUserLogin = (email) => {
    setCurrentUserEmail(email);
    localStorage.setItem('email', email);
    setUserLoggedIn(true);
  };

  const handleUserLogout = () => {
    setUserLoggedIn(false);
    setCurrentUserEmail("");
    localStorage.removeItem("email");
  };


  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1>OnChain KYC Vault</h1>
          <div className="nav-links">
            <a href="/user">User Portal</a>
            <a href="/admin">Admin Portal</a>
            <a href="/verify">Service Verification</a>
          </div>
        </nav>

        <div className="content-container">
          <Routes>
            <Route
              path="/"
              element={
                userLoggedIn ? (
                  <Navigate to="/user" />
                ) : (
                  <Login type="user" onLogin={handleUserLogin} />
                )
              }
            />

            <Route
              path="/user"
              element={
                userLoggedIn ? (
                  <UserDashboard
                    userEmail={currentUserEmail}
                    onLogout={handleUserLogout}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            
            <Route
              path="/admin"
              element={
                adminLoggedIn ? (
                  <AdminDashboard onLogout={() => setAdminLoggedIn(false)} />
                ) : (
                  <Login
                    type="admin"
                    onLogin={() => setAdminLoggedIn(true)}
                  />
                )
              }
            />
            <Route path="/verify" element={<ServiceVerification />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;