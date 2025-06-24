import React, { useState, useEffect } from 'react';
import { kyc_vault_backend } from '../../../declarations/kyc_vault_backend';

// No TypeScript interfaces or type annotations, all converted to plain JavaScript

const AdminDashboard = ({ onLogout }) => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('pending');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [reviewComments, setReviewComments] = useState('');
    
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pendingData, allData] = await Promise.all([
                kyc_vault_backend.getPendingKYCs(),
                kyc_vault_backend.getAllUsers()
            ]);
            
            setPendingUsers(pendingData);
            setAllUsers(allData);
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage('Failed to load user data.');
        }
        setLoading(false);
    };

    const handleApprove = async (email) => {
        setProcessing(true);
        try {
            const comments = reviewComments.trim() ? reviewComments : null;
            const result = await kyc_vault_backend.approveKYC(email, comments ? [comments] : []);
            
            if ('ok' in result) {
                setMessage(`KYC for ${email} approved successfully!`);
                loadData();
                setSelectedUser(null);
                setReviewComments('');
            } else {
                setMessage(`Error: ${result.err}`);
            }
        } catch (error) {
            console.error('Error approving KYC:', error);
            setMessage('Failed to approve KYC. Please try again.');
        }
        setProcessing(false);
    };

    const handleReject = async (email) => {
        setProcessing(true);
        try {
            const comments = reviewComments.trim() ? reviewComments : null;
            const result = await kyc_vault_backend.rejectKYC(email, comments ? [comments] : []);
            
            if ('ok' in result) {
                setMessage(`KYC for ${email} rejected.`);
                loadData();
                setSelectedUser(null);
                setReviewComments('');
            } else {
                setMessage(`Error: ${result.err}`);
            }
        } catch (error) {
            console.error('Error rejecting KYC:', error);
            setMessage('Failed to reject KYC. Please try again.');
        }
        setProcessing(false);
    };

    const formatDate = (timestamp) => {
        // Convert nanoseconds to milliseconds and create a date
        const date = new Date(Number(timestamp) / 1000000);
        return date.toLocaleString();
    };

    const getStatusText = (status) => {
        if ('Pending' in status) return 'Pending';
        if ('Approved' in status) return 'Approved';
        if ('Rejected' in status) return 'Rejected';
        return 'Unknown';
    };

    const getStatusClass = (status) => {
        if ('Pending' in status) return 'status-pending';
        if ('Approved' in status) return 'status-approved';
        if ('Rejected' in status) return 'status-rejected';
        return '';
    };

    if (loading) {
        return <div className="loading">Loading dashboard data...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h2>Admin Dashboard</h2>
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </div>

            <div className="tab-navigation">
                <button 
                    className={viewMode === 'pending' ? 'active' : ''} 
                    onClick={() => setViewMode('pending')}
                >
                    Pending KYCs ({pendingUsers.length})
                </button>
                <button 
                    className={viewMode === 'all' ? 'active' : ''} 
                    onClick={() => setViewMode('all')}
                >
                    All Users ({allUsers.length})
                </button>
            </div>

            {message && (
                <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                    {message}
                    <button onClick={() => setMessage('')} className="close-btn">×</button>
                </div>
            )}

            {selectedUser ? (
                <div className="user-detail">
                    <div className="user-detail-header">
                        <h3>Review KYC: {selectedUser.email}</h3>
                        <button onClick={() => setSelectedUser(null)} className="back-btn">Back to List</button>
                    </div>

                    <div className="user-info-grid">
                        <div className="info-item">
                            <strong>Full Name:</strong> {selectedUser.fullName}
                        </div>
                        <div className="info-item">
                            <strong>Date of Birth:</strong> {selectedUser.dateOfBirth}
                        </div>
                        <div className="info-item">
                            <strong>Country:</strong> {selectedUser.country}
                        </div>
                        <div className="info-item">
                            <strong>Submitted At:</strong> {formatDate(selectedUser.submittedAt)}
                        </div>
                        <div className="info-item full-width">
                            <strong>Document:</strong>
                            {selectedUser.documentUrl ? (
                                <div className="document-preview">
                                    {/* In a real app, this would be a proper document viewer or image */}
                  <p>Document URL: {selectedUser.documentUrl}</p>
                  {/* Simulate document preview */}
                  <div className="document-image-placeholder">
                    Document Preview (Placeholder)
                  </div>
                </div>
              ) : (
                <p>No document provided</p>
              )}
            </div>
          </div>

          <div className="review-section">
            <h4>Review Decision</h4>
            <div className="form-group">
              <label>Review Comments:</label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter comments about this KYC verification..."
                rows={4}
              />
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleApprove(selectedUser.email)} 
                disabled={processing}
                className="approve-btn"
              >
                {processing ? 'Processing...' : 'Approve KYC'}
              </button>
              <button 
                onClick={() => handleReject(selectedUser.email)} 
                disabled={processing}
                className="reject-btn"
              >
                {processing ? 'Processing...' : 'Reject KYC'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Country</th>
                <th>Status</th>
                <th>Submitted</th>
                {viewMode === 'all' && <th>Reviewed</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(viewMode === 'pending' ? pendingUsers : allUsers).map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.fullName}</td>
                  <td>{user.country}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td>{formatDate(user.submittedAt)}</td>
                  {viewMode === 'all' && (
                    <td>
                      {user.reviewedAt.length > 0 ? formatDate(user.reviewedAt[0]) : 'N/A'}
                    </td>
                  )}
                  <td>
                    {'Pending' in user.status ? (
                      <button 
                        onClick={() => setSelectedUser(user)} 
                        className="review-btn"
                      >
                        Review
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedUser(user)} 
                        className="view-btn"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {(viewMode === 'pending' && pendingUsers.length === 0) && (
                <tr>
                  <td colSpan={6} className="no-data">No pending KYC applications</td>
                </tr>
              )}
              
              {(viewMode === 'all' && allUsers.length === 0) && (
                <tr>
                  <td colSpan={7} className="no-data">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;