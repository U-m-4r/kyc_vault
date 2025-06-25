import React, { useEffect, useState } from 'react';
import './UserPortal.css';
import { kyc_vault_backend as backend } from "../../../declarations/kyc_vault_backend";

function UserPortal({ userEmail, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      console.log("Calling backend.getUserProfile with", userEmail); // 🔍 Debug email being passed
    console.log("📩 Fetching profile for", userEmail);


    try {
      const res = await backend.getUserProfile(userEmail);


      console.log("Backend response:", res); // 🔍 Log full backend response
      


      if ("ok" in res) {
        console.log("User profile data:", res.ok);
        setProfile(res.ok);
        console.log("✅ Profile set in state:", res.ok);
      } else if ("err" in res) {
        setError(res.err);
      }
    } catch (err) {
      setError("Unable to fetch profile");
    } finally {
      setLoading(false);
    }
  }
    fetchProfile();
  }, [userEmail]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="message error">{error}</div>;
 if (!profile) {
  return (
    <div className="message info">
      No profile data found.
      <br />
      Current user email: {userEmail}
    </div>
  );
}



  return (
    <div className="user-portal-wrapper">
      <div className="status-card">
        <h3>User Profile Summary</h3>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Full Name:</strong> {profile.fullName || 'Not submitted'}</p>
        <p><strong>Date of Birth:</strong> {profile.dateOfBirth || 'Not submitted'}</p>
        <p><strong>Country:</strong> {profile.country || 'Not submitted'}</p>
        <p><strong>Status:</strong> 
  <span className={`status ${
    profile.status.Approved ? 'green' :
    profile.status.Rejected ? 'red' : 'orange'
  }`}>
    {profile.status.Approved
      ? 'Approved'
      : profile.status.Rejected
      ? 'Rejected'
      : 'Pending'}
  </span>
</p>

        {profile.reviewComments && (
          <div className="review-comments">
            <strong>Review Comments:</strong>
            <p>{profile.reviewComments}</p>
          </div>
        )}
      </div>

      <div className="kyc-form-card">
        <h3>Submitted KYC Document</h3>
        {profile.documentUrl ? (
          <div className="document-preview">
            <a href={profile.documentUrl} target="_blank" rel="noopener noreferrer">View Document</a>
          </div>
        ) : (
          <p>No document submitted yet.</p>
        )}
      </div>

      <div className="verification-card">
        <h3>Actions</h3>
        <ul>
          <li><button onClick={() => alert('Not implemented')}>Update KYC Info</button></li>
          <li><button onClick={() => alert('Not implemented')}>Revoke Access</button></li>
          <li><button onClick={() => alert('Not implemented')}>Download Activity Log</button></li>
        </ul>
      </div>
      <button onClick={onLogout} className="logout-btn">Logout</button>

    </div>
  );
}

export default UserPortal;
