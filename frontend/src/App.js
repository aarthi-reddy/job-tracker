import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import JobForm from './components/JobForm';
import JobBoard from './components/JobBoard';
import AITools from './components/AITools';

const API_URL = 'http://localhost:8080/api/applications';

function App() {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [aiApp, setAiApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(API_URL);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
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
          <p className="subtitle">AI-Powered Job Application Tracker</p>
        </div>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add Application
        </button>
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

      {showForm && (
        <JobForm
          onSubmit={editingApp ? (app) => updateApplication(editingApp.id, app) : addApplication}
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
      />
    </div>
  );
}

export default App;