// AppRoutes.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import ServiceVerification from './ServiceVerfication';
import UserPortal from './UserPortal';
import Login from './Login';

function AppRoutes() {
  const [userLoggedIn, setUserLoggedIn] = useState(localStorage.getItem('email'));
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(localStorage.getItem('email') || '');

  const navigate = useNavigate();

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
    localStorage.removeItem('email');
    setCurrentUserEmail('');
    setUserLoggedIn(false);
    setAdminLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <h1>OnChain KYC Vault</h1>
      <div className="nav-links">
          <Link to="/user-portal">User Portal</Link>
          <Link to="/admin">Admin Portal</Link>
          <Link to="/verify">Service Verification</Link>
        </div>  
      </nav>

      <div className="content-container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route 
            path="/dashboard"
            element={userLoggedIn ? (
              <UserDashboard 
                userEmail={currentUserEmail}
                onLogout={handleUserLogout}
              />
            ) : (
              <Login 
                type="user"
                onLogin={handleUserLogin}
              />
            )}
          />
          <Route 
            path="/user-portal"
            element={userLoggedIn ? (
              <UserPortal 
                userEmail={currentUserEmail}
                onLogout={handleUserLogout}
              />
            ) : (
              <Login 
                type="user"
                onLogin={handleUserLogin}
              />
            )}
          />
          <Route 
            path="/admin"
            element={adminLoggedIn ? (
              <AdminDashboard onLogout={() => setAdminLoggedIn(false)} />
            ) : (
              <Login 
                type="admin"
                onLogin={() => setAdminLoggedIn(true)}
              />
            )}
          />
          <Route path="/verify" element={<ServiceVerification />} />
        </Routes>
      </div>
    </>
  );
}

export default AppRoutes;
