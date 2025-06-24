import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ServiceVerification from './components/ServiceVerfication';
import Login from './components/Login';
import './index.scss';

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(localStorage.getItem('email'));
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
            <Route path="/" element={<Navigate to="/user" />} />
            <Route 
              path="/user" 
              element={
                userLoggedIn ? (
                  <UserDashboard 
                    userEmail={currentUserEmail} 
                    onLogout={() => setUserLoggedIn(false)}
                  />
                ) : (
                  <Login 
                    type="user" 
                    onLogin={handleUserLogin}
                  />
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