import React, { useState, useEffect } from "react";
import { kyc_vault_backend } from "../../../declarations/kyc_vault_backend";

const UserDashboard = ({
  userEmail,
  onLogout,
}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // KYC Form state
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [document, setDocument] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, [userEmail]);

  const loadUserProfile = async () => {
    try {
      const result = await kyc_vault_backend.getUserProfile(userEmail);
      if ("ok" in result) {
        setUserProfile(result.ok);
        setFullName(result.ok.fullName);
        setDateOfBirth(result.ok.dateOfBirth);
        setCountry(result.ok.country);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      // For MVP, we'll use a placeholder URL for document
      // In production, you'd upload to IPFS or similar
      const documentUrl = document ? `document_${Date.now()}.jpg` : "";

      const result = await kyc_vault_backend.submitKYC(
        userEmail,
        fullName,
        dateOfBirth,
        country,
        documentUrl
      );

      if ("ok" in result) {
        setMessage("KYC submitted successfully!");
        loadUserProfile();
      } else {
        setMessage(result.err);
      }
    } catch (error) {
      setMessage("Error submitting KYC. Please try again.");
    }

    setSubmitting(false);
  };

  const generateVerificationCode = async () => {
    try {
      const result = await kyc_vault_backend.generateVerificationCode(
        userEmail
      );
      if ("ok" in result) {
        setVerificationCode(result.ok);
        setMessage("Verification code generated successfully!");
      } else {
        setMessage(result.err);
      }
    } catch (error) {
      setMessage("Error generating verification code.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getStatusColor = (status) => {
    if (status.Approved) return "green";
    if (status.Rejected) return "red";
    return "orange";
  };

  const getStatusText = (status) => {
    if (status.Approved) return "Approved";
    if (status.Rejected) return "Rejected";
    return "Pending";
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>User Dashboard</h2>
        <div>
          <span>Welcome, {userEmail}</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {userProfile && (
          <div className="status-card">
            <h3>KYC Status</h3>
            <div className={`status ${getStatusColor(userProfile.status)}`}>
              {getStatusText(userProfile.status)}
            </div>
            {userProfile.reviewComments && (
              <div className="review-comments">
                <strong>Review Comments:</strong>{" "}
                {userProfile.reviewComments[0]}
              </div>
            )}
          </div>
        )}

        <div className="kyc-form-card">
          <h3>KYC Information</h3>
          <form onSubmit={handleKYCSubmit}>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>ID Document:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDocument(e.target.files?.[0] || null)}
                required={!userProfile?.documentUrl}
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit KYC"}
            </button>
          </form>
        </div>

        {userProfile?.status?.Approved && (
          <div className="verification-card">
            <h3>Share Verification</h3>
            <p>
              Generate a one-time code to share your verification status with
              services.
            </p>
            <button onClick={generateVerificationCode}>
              Generate Verification Code
            </button>
            {verificationCode && (
              <div className="verification-code">
                <strong>Your Verification Code:</strong>
                <div className="code">{verificationCode}</div>
                <p>
                  <small>
                    This code expires in 24 hours and can only be used once.
                  </small>
                </p>
              </div>
            )}
          </div>
        )}

        {message && (
          <div
            className={`message ${
              message.includes("successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
