import React, { useState } from 'react';
import { kyc_vault_backend } from '../../../declarations/kyc_vault_backend';

const ServiceVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationResult(null);

    try {
      const result = await kyc_vault_backend.verifyCode(verificationCode);

      if ('ok' in result) {
        setVerificationResult({
          verified: result.ok.verified,
          userInfo: result.ok.userInfo[0] || null
        });
      } else {
        setVerificationResult({
          verified: false,
          error: result.err
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        verified: false,
        error: 'An unexpected error occurred during verification.'
      });
    }

    setLoading(false);
  };

  const handleReset = () => {
    setVerificationCode('');
    setVerificationResult(null);
  };

  return (
    <div className="service-verification">
      <div className="verification-container">
        <h2>KYC Verification Service</h2>
        <p className="service-description">
          Verify a user's KYC status using their verification code.
          This service is intended for third-party applications that need to confirm a user's identity.
        </p>

        {!verificationResult ? (
          <form onSubmit={handleVerify} className="verification-form">
            <div className="form-group">
              <label>Verification Code:</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code (e.g., KYC123456)"
                required
              />
            </div>

            <button type="submit" disabled={loading || !verificationCode.trim()}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        ) : (
          <div className="verification-result">
            {verificationResult.verified ? (
              <div className="success-result">
                <div className="result-icon">✅</div>
                <h3>Verification Successful!</h3>
                
                {verificationResult.userInfo ? (
                  <div className="user-info">
                    <p><strong>Name:</strong> {verificationResult.userInfo.fullName}</p>
                    <p><strong>Country:</strong> {verificationResult.userInfo.country}</p>
                    <p className="verification-note">
                      This user has completed KYC verification and their identity has been confirmed.
                    </p>
                  </div>
                ) : (
                  <p>User verification is valid, but detailed information is not available.</p>
                )}
              </div>
            ) : (
              <div className="error-result">
                <div className="result-icon">❌</div>
                <h3>Verification Failed</h3>
                <p>{verificationResult.error || "Invalid verification code."}</p>
              </div>
            )}

            <button onClick={handleReset} className="reset-btn">
              Verify Another Code
            </button>
          </div>
        )}

        <div className="verification-info">
          <h4>How Verification Works</h4>
          <ol>
            <li>Users complete their KYC process on the platform</li>
            <li>Admins review and approve their verification</li>
            <li>Users generate a one-time verification code</li>
            <li>Services use this code to verify user's KYC status</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ServiceVerification;