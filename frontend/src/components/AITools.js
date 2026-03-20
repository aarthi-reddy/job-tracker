import React, { useState } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiFileText, FiHelpCircle, FiX, FiUpload } from 'react-icons/fi';

const AI_URL = '/api/ai';

function AITools({ app, onClose }) {

  const [activeTab, setActiveTab] = useState('interview');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  if (!app) return null;

  const getInterviewQuestions = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await axios.post(`${AI_URL}/interview-questions`, {
        company: app.company,
        role: app.role,
      });
      setResult(response.data.questions);
    } catch (error) {
      setResult('Error generating questions. Please try again.');
    }
    setLoading(false);
  };

  const getResumeFeedback = async () => {
    setLoading(true);
    setResult('');
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('targetRole', app.role);
        const response = await axios.post(`${AI_URL}/upload-resume`, formData);
        setResult(response.data.feedback);
      } else if (resumeText.trim()) {
        const response = await axios.post(`${AI_URL}/resume-feedback`, {
          resumeText: resumeText,
          targetRole: app.role,
        });
        setResult(response.data.feedback);
      }
    } catch (error) {
      setResult('Error getting feedback. Please try again.');
    }
    setLoading(false);
  };

  const getCoverLetter = async () => {
    setLoading(true);
    setResult('');
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('company', app.company);
        formData.append('role', app.role);
        const response = await axios.post(`${AI_URL}/upload-resume-cover-letter`, formData);
        setResult(response.data.coverLetter);
      } else if (resumeText.trim()) {
        const response = await axios.post(`${AI_URL}/cover-letter`, {
          company: app.company,
          role: app.role,
          resumeText: resumeText,
        });
        setResult(response.data.coverLetter);
      }
    } catch (error) {
      setResult('Error generating cover letter. Please try again.');
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setResumeText('');
    }
  };

  const formatResult = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-header">
          <div>
            <h2>AI Tools</h2>
            <p className="ai-subtitle">{app.company} — {app.role}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="ai-tabs">
          <button
            className={`ai-tab ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('interview'); setResult(''); }}
          >
            <FiHelpCircle /> Interview Prep
          </button>
          <button
            className={`ai-tab ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => { setActiveTab('resume'); setResult(''); }}
          >
            <FiFileText /> Resume Review
          </button>
          <button
            className={`ai-tab ${activeTab === 'cover' ? 'active' : ''}`}
            onClick={() => { setActiveTab('cover'); setResult(''); }}
          >
            <FiMessageSquare /> Cover Letter
          </button>
        </div>

        <div className="ai-body">
          {activeTab === 'interview' && (
            <div>
              <p className="ai-description">
                Generate interview questions specific to {app.company} for the {app.role} position.
              </p>
              <button
                className="ai-generate-btn"
                onClick={getInterviewQuestions}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Interview Questions'}
              </button>
            </div>
          )}

          {(activeTab === 'resume' || activeTab === 'cover') && (
            <div>
              <p className="ai-description">
                {activeTab === 'resume'
                  ? `Upload your resume PDF or paste text to get AI feedback for the ${app.role} role.`
                  : `Generate a custom cover letter for ${app.company}. Upload your resume for personalization.`}
              </p>

              <div className="upload-section">
                <label className="file-upload-btn">
                  <FiUpload /> {resumeFile ? resumeFile.name : 'Upload Resume PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {resumeFile && (
                  <button className="clear-file" onClick={() => setResumeFile(null)}>
                    Clear
                  </button>
                )}
              </div>

              {!resumeFile && (
                <div className="or-divider">
                  <span>or paste resume text</span>
                </div>
              )}

              {!resumeFile && (
                <textarea
                  className="ai-textarea"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  rows={6}
                />
              )}

              <button
                className="ai-generate-btn"
                onClick={activeTab === 'resume' ? getResumeFeedback : getCoverLetter}
                disabled={loading || (!resumeFile && !resumeText.trim())}
              >
                {loading
                  ? (activeTab === 'resume' ? 'Analyzing...' : 'Writing...')
                  : (activeTab === 'resume' ? 'Get Resume Feedback' : 'Generate Cover Letter')}
              </button>
            </div>
          )}

          {loading && (
            <div className="ai-loading">
              <div className="spinner"></div>
              <p>AI is thinking...</p>
            </div>
          )}

          {result && (
            <div className="ai-result">
              {formatResult(result)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AITools;