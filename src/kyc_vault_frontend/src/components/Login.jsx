import React, { useState } from "react";
import { kyc_vault_backend } from "../../../declarations/kyc_vault_backend";

const Login = ({ type = "user", onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (type === "admin") {
        const result = await kyc_vault_backend.adminLogin(email, password);
        if ("ok" in result) {
          onLogin();
        } else {
          setMessage(result.err);
        }
      } else {
        if (isRegistering) {
          const result = await kyc_vault_backend.registerUser(
            email,
            password
          );
          if ("ok" in result) {
            setMessage("Registration successful! Please login.");
            setIsRegistering(false);
          } else {
            setMessage(result.err);
          }
        } else {
          // For MVP, we'll just simulate login for users
          // In production, you'd implement proper authentication
          // onLogin(email);
          try {
            const result = await kyc_vault_backend.userLogin(email, password);
            if ("ok" in result) {
              onLogin(email);
              // navigate("/user");
            } else {
              setMessage(result.err);
            }
          } catch (error) {
            console.error("User login error:", error);
            setMessage("Invalid username or password");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>
          {type === "admin"
            ? "Admin Login"
            : isRegistering
              ? "User Registration"
              : "User Login"}
        </h2>

        {type === "admin" && (
          <div className="admin-info">
            <p>
              <strong>Demo Admin Credentials:</strong>
            </p>
            <p>Email: admin@kycvault.com</p>
            <p>Password: admin123</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading
              ? "Processing..."
              : type === "admin"
                ? "Login"
                : isRegistering
                  ? "Register"
                  : "Login"}
          </button>
        </form>

        {type === "user" && (
          <p>
            {isRegistering
              ? "Already have an account? "
              : "Don't have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Login" : "Register"}
            </button>
          </p>
        )}

        {message && (
          <div
            className={`message ${message.includes("successful") ? "success" : "error"
              }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
