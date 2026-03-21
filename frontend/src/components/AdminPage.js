import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Access denied');
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;
  if (error) return (
    <div className="admin-page">
      <div className="admin-error">
        <h2>⛔ {error}</h2>
        <p>You don't have permission to view this page.</p>
        <button onClick={onBack} className="btn-back">← Back to Dashboard</button>
      </div>
    </div>
  );

  const statusColors = {
    APPLIED: '#3b82f6',
    SCREENING: '#8b5cf6',
    INTERVIEW: '#f59e0b',
    OFFER: '#22c55e',
    REJECTED: '#ef4444',
    WITHDRAWN: '#6b7280'
  };

  const maxApps = stats.users.length > 0
    ? Math.max(...stats.users.map(u => u.applicationCount), 1)
    : 1;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button onClick={onBack} className="btn-back">← Back to Dashboard</button>
        <h1>📊 Admin Dashboard</h1>
        <p className="admin-subtitle">JobTracker Platform Overview</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card stat-users">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card stat-apps">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card stat-docs">
          <div className="stat-icon">📄</div>
          <div className="stat-number">{stats.totalDocuments}</div>
          <div className="stat-label">Documents Uploaded</div>
        </div>
        <div className="stat-card stat-avg">
          <div className="stat-icon">📈</div>
          <div className="stat-number">
            {stats.totalUsers > 0 ? (stats.totalApplications / stats.totalUsers).toFixed(1) : 0}
          </div>
          <div className="stat-label">Avg Apps/User</div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-section">
          <h2>Application Status Breakdown</h2>
          <div className="status-chart">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="status-bar-row">
                <span className="status-bar-label">{status}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(count / stats.totalApplications) * 100}%`,
                      backgroundColor: statusColors[status] || '#6b7280'
                    }}
                  />
                </div>
                <span className="status-bar-count">{count}</span>
              </div>
            ))}
            {Object.keys(stats.statusBreakdown).length === 0 && (
              <p className="no-data">No applications yet</p>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Registered Users ({stats.users.length})</h2>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Apps</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map((user, i) => (
                  <tr key={user.id}>
                    <td>{i + 1}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="user-app-bar">
                        <div
                          className="user-app-bar-fill"
                          style={{ width: `${(user.applicationCount / maxApps) * 100}%` }}
                        />
                        <span>{user.applicationCount}</span>
                      </div>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;