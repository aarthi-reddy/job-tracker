import React, { useState } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiFileText, FiHelpCircle, FiX, FiLoader } from 'react-icons/fi';

const AI_URL = 'http://localhost:8080/api/ai';

function AITools({ app, onClose }) {
  const [activeTab, setActiveTab] = useState('interview');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');

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
    if (!resumeText.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await axios.post(`${AI_URL}/resume-feedback`, {
        resumeText: resumeText,
        targetRole: app.role,
      });
      setResult(response.data.feedback);
    } catch (error) {
      setResult('Error getting feedback. Please try again.');
    }
    setLoading(false);
  };

  const getCoverLetter = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await axios.post(`${AI_URL}/cover-letter`, {
        company: app.company,
        role: app.role,
        resumeText: resumeText,
      });
      setResult(response.data.coverLetter);
    } catch (error) {
      setResult('Error generating cover letter. Please try again.');
    }
    setLoading(false);
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

          {activeTab === 'resume' && (
            <div>
              <p className="ai-description">
                Paste your resume text below to get AI feedback tailored for the {app.role} role.
              </p>
              <textarea
                className="ai-textarea"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={6}
              />
              <button
                className="ai-generate-btn"
                onClick={getResumeFeedback}
                disabled={loading || !resumeText.trim()}
              >
                {loading ? 'Analyzing...' : 'Get Resume Feedback'}
              </button>
            </div>
          )}

          {activeTab === 'cover' && (
            <div>
              <p className="ai-description">
                Generate a custom cover letter for {app.company}. Paste your resume for personalization.
              </p>
              <textarea
                className="ai-textarea"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={6}
              />
              <button
                className="ai-generate-btn"
                onClick={getCoverLetter}
                disabled={loading || !resumeText.trim()}
              >
                {loading ? 'Writing...' : 'Generate Cover Letter'}
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