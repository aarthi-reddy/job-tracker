import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import JobForm from './components/JobForm';
import JobBoard from './components/JobBoard';
import AITools from './components/AITools';
import AuthPage from './components/AuthPage';
import { FiZap, FiLogOut } from 'react-icons/fi';
import AdminPage from './components/AdminPage';

const API_URL = '/api/applications';
const AI_URL = '/api/ai';

function App() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [aiApp, setAiApp] = useState(null);
  const [showSmartAdd, setShowSmartAdd] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [smartLoading, setSmartLoading] = useState(false);
  const [showJobMatch, setShowJobMatch] = useState(false);
  const [jobMatchLoading, setJobMatchLoading] = useState(false);
  const [jobMatchResults, setJobMatchResults] = useState(null);
  const [jobMatchFile, setJobMatchFile] = useState(null);
  const [jobMatchText, setJobMatchText] = useState('');
  const [jobSearchFilters, setJobSearchFilters] = useState({
    keywords: '', location: '', experience: '', jobType: '', posted: ''
  });

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

  const handleSmartSearch = () => {
    const filters = jobSearchFilters;
    const results = [{
      title: filters.keywords,
      match_reason: `Direct search for ${filters.keywords}${filters.location ? ' in ' + filters.location : ''}${filters.experience ? ' (' + filters.experience + ' level)' : ''}`,
      salary_range: 'Varies',
      search_keywords: filters.keywords + (filters.experience === 'internship' ? ' intern' : filters.experience === 'entry' ? ' entry level junior' : filters.experience === 'senior' ? ' senior lead' : '')
    }];
    setJobMatchResults(results);
  };

  const handleAIJobMatch = async () => {
    setJobMatchLoading(true);
    setJobMatchResults(null);
    try {
      let text = jobMatchText;
      if (jobMatchFile) {
        const formData = new FormData();
        formData.append('file', jobMatchFile);
        formData.append('targetRole', 'Software Engineer');
        const uploadRes = await axios.post('/api/ai/upload-resume', formData);
        text = uploadRes.data.text || uploadRes.data.feedback;
      }
      const res = await axios.post('/api/ai/job-match', { resumeText: text });
      const cleaned = res.data.result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      try {
        setJobMatchResults(JSON.parse(cleaned));
      } catch (e) {
        setJobMatchResults(null);
      }
    } catch (err) {
      console.error(err);
    }
    setJobMatchLoading(false);
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

  if (showAdmin) {
    return <AdminPage onBack={() => setShowAdmin(false)} />;
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
          <button onClick={() => setShowJobMatch(true)} className="job-match-header-btn">🔍 Job Match
          </button>
          <button className="smart-add-btn" onClick={() => setShowSmartAdd(true)}>
            <FiZap /> Smart Add
          </button>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add Application
          </button>
          {user && user.email === 'aarthireddy.chinnu@gmail.com' && (
            <button onClick={() => setShowAdmin(true)} className="btn-admin">📊 Admin</button>
          )}
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

      {showJobMatch && (
        <div className="modal-overlay" onClick={() => { setShowJobMatch(false); setJobMatchResults(null); setJobMatchFile(null); setJobMatchText(''); }}>
          <div className="job-search-modal" onClick={e => e.stopPropagation()}>
            <div className="job-search-header">
              <div>
                <h2>🔍 Smart Job Search</h2>
                <p>AI-powered job search across multiple platforms</p>
              </div>
              <button onClick={() => { setShowJobMatch(false); setJobMatchResults(null); setJobMatchFile(null); setJobMatchText(''); }} className="ai-close-btn">✕</button>
            </div>
            <div className="job-search-body">
              {!jobMatchResults ? (
                <div className="job-search-content">
                  <div className="job-search-left">
                    <h3>📋 Search Filters</h3>
                    <div className="search-field">
                      <label>Job Title / Keywords</label>
                      <input type="text" placeholder="e.g. Software Engineer, Data Analyst" value={jobSearchFilters.keywords} onChange={e => setJobSearchFilters({...jobSearchFilters, keywords: e.target.value})} />
                    </div>
                    <div className="search-field">
                      <label>Location</label>
                      <input type="text" placeholder="e.g. San Francisco, Remote" value={jobSearchFilters.location} onChange={e => setJobSearchFilters({...jobSearchFilters, location: e.target.value})} />
                    </div>
                    <div className="search-row">
                      <div className="search-field">
                        <label>Experience Level</label>
                        <select value={jobSearchFilters.experience} onChange={e => setJobSearchFilters({...jobSearchFilters, experience: e.target.value})}>
                          <option value="">Any</option>
                          <option value="internship">Internship</option>
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid Level</option>
                          <option value="senior">Senior Level</option>
                        </select>
                      </div>
                      <div className="search-field">
                        <label>Job Type</label>
                        <select value={jobSearchFilters.jobType} onChange={e => setJobSearchFilters({...jobSearchFilters, jobType: e.target.value})}>
                          <option value="">Any</option>
                          <option value="fulltime">Full-time</option>
                          <option value="parttime">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                          <option value="remote">Remote</option>
                        </select>
                      </div>
                    </div>
                    <div className="search-field">
                      <label>Posted Within</label>
                      <select value={jobSearchFilters.posted} onChange={e => setJobSearchFilters({...jobSearchFilters, posted: e.target.value})}>
                        <option value="">Any time</option>
                        <option value="24hr">Last 24 hours</option>
                        <option value="3days">Last 3 days</option>
                        <option value="week">Past week</option>
                        <option value="month">Past month</option>
                      </select>
                    </div>
                    <button onClick={handleSmartSearch} disabled={!jobSearchFilters.keywords} className="search-now-btn">
                      🔍 Search Jobs
                    </button>
                  </div>
                  <div className="job-search-right">
                    <h3>🤖 AI Resume Match</h3>
                    <p className="search-ai-desc">Upload your resume and AI will suggest the best search keywords for you</p>
                    <input type="file" accept=".pdf" onChange={e => setJobMatchFile(e.target.files[0])} className="ai-file-input" />
                    <p className="ai-or">— or paste resume text —</p>
                    <textarea value={jobMatchText} onChange={e => setJobMatchText(e.target.value)} placeholder="Paste your resume text..." rows={6} className="ai-textarea" />
                    <button onClick={handleAIJobMatch} disabled={jobMatchLoading || (!jobMatchFile && !jobMatchText)} className="ai-suggest-btn">
                      {jobMatchLoading ? '🔄 Analyzing...' : '✨ AI Suggest Jobs'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="job-search-results">
                  <div className="job-search-results-header">
                    <h3>🎯 {jobMatchResults.length} Matching Jobs Found</h3>
                    <button onClick={() => { setJobMatchResults(null); setJobMatchFile(null); setJobMatchText(''); }} className="job-match-retry-btn">← Back to Search</button>
                  </div>
                  <div className="job-match-results-grid">
                    {jobMatchResults.map((job, i) => (
                      <div key={i} className="job-match-result-card">
                        <div className="job-match-result-header">
                          <span className="job-match-rank">#{i + 1}</span>
                          <h4>{job.title}</h4>
                          <span className="job-match-salary">{job.salary_range}</span>
                        </div>
                        <p className="job-match-result-reason">{job.match_reason}</p>
                        <div className="job-match-result-links">
                          <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.search_keywords || job.title)}${jobSearchFilters.location ? '&location=' + encodeURIComponent(jobSearchFilters.location) : ''}&f_TPR=${jobSearchFilters.posted === '24hr' ? 'r86400' : jobSearchFilters.posted === '3days' ? 'r259200' : jobSearchFilters.posted === 'week' ? 'r604800' : jobSearchFilters.posted === 'month' ? 'r2592000' : ''}`} target="_blank" rel="noreferrer">🔗 LinkedIn</a>
                          <a href={`https://www.indeed.com/jobs?q=${encodeURIComponent(job.search_keywords || job.title)}${jobSearchFilters.location ? '&l=' + encodeURIComponent(jobSearchFilters.location) : ''}${jobSearchFilters.posted === '24hr' ? '&fromage=1' : jobSearchFilters.posted === '3days' ? '&fromage=3' : jobSearchFilters.posted === 'week' ? '&fromage=7' : jobSearchFilters.posted === 'month' ? '&fromage=30' : ''}`} target="_blank" rel="noreferrer">🔗 Indeed</a>
                          <a href={`https://www.google.com/search?q=${encodeURIComponent(job.title + ' jobs' + (jobSearchFilters.location ? ' ' + jobSearchFilters.location : ''))}&ibp=htl;jobs`} target="_blank" rel="noreferrer">🔗 Google Jobs</a>
                          <a href={`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(job.search_keywords || job.title)}${jobSearchFilters.location ? '&locT=C&locKeyword=' + encodeURIComponent(jobSearchFilters.location) : ''}`} target="_blank" rel="noreferrer">🔗 Glassdoor</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;