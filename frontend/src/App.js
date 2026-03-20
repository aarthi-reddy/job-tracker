import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import JobForm from './components/JobForm';
import JobBoard from './components/JobBoard';
import AITools from './components/AITools';
import AuthPage from './components/AuthPage';
import { FiZap, FiLogOut } from 'react-icons/fi';

const API_URL = '/api/applications';
const AI_URL = '/api/ai';

function App() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [aiApp, setAiApp] = useState(null);
  const [showSmartAdd, setShowSmartAdd] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [smartLoading, setSmartLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchApplications();
    }
  }, []);

  const handleLogin = (data) => {
    setUser({ email: data.email, fullName: data.fullName });
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    fetchApplications();
  };

  const handleLogout = () => {
    setUser(null);
    setApplications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(API_URL);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const addApplication = async (app) => {
    try {
      await axios.post(API_URL, app);
      fetchApplications();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding application:', error);
    }
  };

  const updateApplication = async (id, app) => {
    try {
      await axios.put(`${API_URL}/${id}`, app);
      fetchApplications();
      setEditingApp(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const deleteApplication = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus });
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingApp(null);
  };

  const handleSmartAdd = async () => {
    if (!jobDescription.trim()) return;
    setSmartLoading(true);
    try {
      let response;
      const input = jobDescription.trim();

      if (input.startsWith('http://') || input.startsWith('https://')) {
        response = await axios.post(`${AI_URL}/extract-job-url`, { url: input });
      } else {
        response = await axios.post(`${AI_URL}/extract-job`, { jobDescription: input });
      }

      const cleanResult = response.data.result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResult);
      setEditingApp({
        company: parsed.company || '',
        role: parsed.role || '',
        notes: parsed.notes || '',
        status: 'APPLIED',
        jobUrl: input.startsWith('http') ? input : '',
      });
      setShowSmartAdd(false);
      setJobDescription('');
      setShowForm(true);
    } catch (error) {
      console.error('Error parsing job:', error);
      alert('Could not parse job details. Please try again or add manually.');
    }
    setSmartLoading(false);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'APPLIED').length,
    interviewing: applications.filter(a => ['PHONE_SCREEN', 'TECHNICAL', 'ONSITE'].includes(a.status)).length,
    offers: applications.filter(a => a.status === 'OFFER').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>JobTracker</h1>
          <p className="subtitle">Welcome, {user.fullName}</p>
        </div>
        <div className="header-buttons">
          <button className="smart-add-btn" onClick={() => setShowSmartAdd(true)}>
            <FiZap /> Smart Add
          </button>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add Application
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card applied">
          <span className="stat-number">{stats.applied}</span>
          <span className="stat-label">Applied</span>
        </div>
        <div className="stat-card interviewing">
          <span className="stat-number">{stats.interviewing}</span>
          <span className="stat-label">Interviewing</span>
        </div>
        <div className="stat-card offer">
          <span className="stat-number">{stats.offers}</span>
          <span className="stat-label">Offers</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-number">{stats.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      {showSmartAdd && (
        <div className="modal-overlay" onClick={() => setShowSmartAdd(false)}>
          <div className="smart-add-modal" onClick={(e) => e.stopPropagation()}>
            <h2><FiZap /> Smart Add</h2>
            <p className="smart-add-description">
              Paste a job URL or job description and AI will extract the details for you.
            </p>
            <textarea
              className="smart-add-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job URL or description... (e.g. https://careers.google.com/jobs/... or copy the job text)"
              rows={10}
            />
            <div className="smart-add-actions">
              <button className="cancel-btn" onClick={() => setShowSmartAdd(false)}>
                Cancel
              </button>
              <button
                className="ai-generate-btn"
                onClick={handleSmartAdd}
                disabled={smartLoading || !jobDescription.trim()}
              >
                {smartLoading ? 'Extracting...' : 'Extract & Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <JobForm
          onSubmit={editingApp && editingApp.id ? (app) => updateApplication(editingApp.id, app) : addApplication}
          onClose={handleCloseForm}
          initialData={editingApp}
        />
      )}

      {aiApp && (
        <AITools app={aiApp} onClose={() => setAiApp(null)} />
      )}

      <JobBoard
        applications={applications}
        onUpdateStatus={updateStatus}
        onEdit={handleEdit}
        onDelete={deleteApplication}
        onAI={setAiApp}
        onRefresh={fetchApplications}
      />
    </div>
  );
}

export default App;