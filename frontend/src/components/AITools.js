import React, { useState } from 'react';
import axios from 'axios';

const AITools = ({ app, onClose }) => {
  const [activeTab, setActiveTab] = useState('interview');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Interview
  const [questionType, setQuestionType] = useState('technical');
  const [numQuestions, setNumQuestions] = useState(5);

  // Resume Review
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // Cover Letter
  const [coverLetterText, setCoverLetterText] = useState('');

  // Skill Gap
  const [skillGapResume, setSkillGapResume] = useState('');
  const [skillGapJob, setSkillGapJob] = useState('');
  const [skillGapFile, setSkillGapFile] = useState(null);
  const [skillGapResult, setSkillGapResult] = useState(null);

  // Job Match
  const [jobMatchResume, setJobMatchResume] = useState('');
  const [jobMatchFile, setJobMatchFile] = useState(null);
  const [jobMatches, setJobMatches] = useState(null);

  // Resume Score
  const [scoreResume, setScoreResume] = useState('');
  const [scoreFile, setScoreFile] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);

  if (!app) return null;

  const extractPdfText = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post('/api/ai/upload-resume', formData);
    return res.data.text;
  };

  const parseJSON = (text) => {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  };

  const handleInterview = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await axios.post('/api/ai/interview-questions', {
        company: app.company,
        role: app.role,
        type: questionType,
        count: numQuestions
      });
      setResult(res.data.questions);
    } catch (err) {
      setResult('Error generating questions.');
    }
    setLoading(false);
  };

  const handleResumeReview = async () => {
    setLoading(true);
    setResult('');
    try {
      let text = resumeText;
      if (resumeFile) text = await extractPdfText(resumeFile);
      const res = await axios.post('/api/ai/resume-feedback', {
              resumeText: text,
              targetRole: app.role
            });
      setResult(res.data.feedback);
    } catch (err) {
      setResult('Error reviewing resume.');
    }
    setLoading(false);
  };

  const handleCoverLetter = async () => {
    setLoading(true);
    setResult('');
    try {
      let text = coverLetterText;
      if (resumeFile) text = await extractPdfText(resumeFile);
      const res = await axios.post('/api/ai/cover-letter', {
        resumeText: text,
        role: app.role,
        company: app.company
      });
      setResult(res.data.coverLetter);
    } catch (err) {
      setResult('Error generating cover letter.');
    }
    setLoading(false);
  };

  const handleJobMatch = async () => {
    setLoading(true);
    setJobMatches(null);
    setResult('');
    try {
      let text = jobMatchResume;
      if (jobMatchFile) text = await extractPdfText(jobMatchFile);
      const res = await axios.post('/api/ai/job-match', { resumeText: text });
      const parsed = parseJSON(res.data.result);
      if (parsed) {
        setJobMatches(parsed);
      } else {
        setResult(res.data.result);
      }
    } catch (err) {
      setResult('Error analyzing resume.');
    }
    setLoading(false);
  };

  const handleSkillGap = async () => {
    setLoading(true);
    setSkillGapResult(null);
    setResult('');
    try {
      let text = skillGapResume;
      if (skillGapFile) text = await extractPdfText(skillGapFile);
      const res = await axios.post('/api/ai/skill-gap', {
        resumeText: text,
        jobDescription: skillGapJob
      });
      const parsed = parseJSON(res.data.result);
      if (parsed) {
        setSkillGapResult(parsed);
      } else {
        setResult(res.data.result);
      }
    } catch (err) {
      setResult('Error analyzing skill gap.');
    }
    setLoading(false);
  };

  const handleResumeScore = async () => {
    setLoading(true);
    setScoreResult(null);
    setResult('');
    try {
      let text = scoreResume;
      if (scoreFile) text = await extractPdfText(scoreFile);
      const res = await axios.post('/api/ai/resume-score', { resumeText: text });
      const parsed = parseJSON(res.data.result);
      if (parsed) {
        setScoreResult(parsed);
      } else {
        setResult(res.data.result);
      }
    } catch (err) {
      setResult('Error scoring resume.');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'interview', label: '🎯 Interview' },
    { id: 'resume', label: '📝 Resume Review' },
    { id: 'cover', label: '✉️ Cover Letter' },
    { id: 'jobmatch', label: '🔍 Job Match' },
    { id: 'skillgap', label: '📊 Skill Gap' },
    { id: 'score', label: '💯 Resume Score' }
  ];

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={e => e.stopPropagation()}>
        <div className="ai-modal-header">
          <h2>AI Career Coach — {app.company} ({app.role})</h2>
          <button onClick={onClose} className="ai-close-btn">✕</button>
        </div>

        <div className="ai-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setResult(''); setJobMatches(null); setSkillGapResult(null); setScoreResult(null); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ai-content">
          {activeTab === 'interview' && (
            <div>
              <div className="ai-form-row">
                <select value={questionType} onChange={e => setQuestionType(e.target.value)}>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="system-design">System Design</option>
                  <option value="mixed">Mixed</option>
                </select>
                <select value={numQuestions} onChange={e => setNumQuestions(e.target.value)}>
                  {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
                <button onClick={handleInterview} disabled={loading} className="ai-btn">
                  {loading ? 'Generating...' : 'Generate Questions'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div>
              <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files[0])} className="ai-file-input" />
              <p className="ai-or">— or paste your resume text —</p>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste resume text here..." rows={6} className="ai-textarea" />
              <button onClick={handleResumeReview} disabled={loading && !resumeText && !resumeFile} className="ai-btn">
                {loading ? 'Analyzing...' : 'Review Resume'}
              </button>
            </div>
          )}

          {activeTab === 'cover' && (
            <div>
              <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files[0])} className="ai-file-input" />
              <p className="ai-or">— or paste your resume/details —</p>
              <textarea value={coverLetterText} onChange={e => setCoverLetterText(e.target.value)} placeholder="Paste resume or key details..." rows={6} className="ai-textarea" />
              <button onClick={handleCoverLetter} disabled={loading} className="ai-btn">
                {loading ? 'Writing...' : 'Generate Cover Letter'}
              </button>
            </div>
          )}

          {activeTab === 'jobmatch' && (
            <div>
              <input type="file" accept=".pdf" onChange={e => setJobMatchFile(e.target.files[0])} className="ai-file-input" />
              <p className="ai-or">— or paste your resume text —</p>
              <textarea value={jobMatchResume} onChange={e => setJobMatchResume(e.target.value)} placeholder="Paste resume text here..." rows={6} className="ai-textarea" />
              <button onClick={handleJobMatch} disabled={loading} className="ai-btn">
                {loading ? 'Finding Matches...' : '🔍 Find Matching Jobs'}
              </button>
              {jobMatches && (
                <div className="job-matches">
                  {jobMatches.map((job, i) => (
                    <div key={i} className="job-match-card">
                      <div className="job-match-header">
                        <h3>{job.title}</h3>
                        <span className="job-salary">{job.salary_range}</span>
                      </div>
                      <p className="job-match-reason">{job.match_reason}</p>
                      <div className="job-search-links">
                        <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.search_keywords || job.title)}`} target="_blank" rel="noreferrer">LinkedIn</a>
                        <a href={`https://www.indeed.com/jobs?q=${encodeURIComponent(job.search_keywords || job.title)}`} target="_blank" rel="noreferrer">Indeed</a>
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(job.title + ' jobs')}`} target="_blank" rel="noreferrer">Google</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skillgap' && (
            <div>
              <input type="file" accept=".pdf" onChange={e => setSkillGapFile(e.target.files[0])} className="ai-file-input" />
              <p className="ai-or">— or paste your resume text —</p>
              <textarea value={skillGapResume} onChange={e => setSkillGapResume(e.target.value)} placeholder="Paste resume text here..." rows={4} className="ai-textarea" />
              <textarea value={skillGapJob} onChange={e => setSkillGapJob(e.target.value)} placeholder="Paste the job description here..." rows={4} className="ai-textarea" style={{ marginTop: '10px' }} />
              <button onClick={handleSkillGap} disabled={loading} className="ai-btn">
                {loading ? 'Analyzing...' : '📊 Analyze Skill Gap'}
              </button>
              {skillGapResult && (
                <div className="skill-gap-results">
                  <div className="skill-gap-score">
                    <div className="score-circle" style={{ '--score-color': skillGapResult.match_percentage >= 70 ? '#22c55e' : skillGapResult.match_percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                      <span>{skillGapResult.match_percentage}%</span>
                    </div>
                    <p>Match Score</p>
                  </div>
                  <p className="skill-gap-summary">{skillGapResult.summary}</p>
                  <div className="skill-columns">
                    <div className="skill-col skill-have">
                      <h4>✅ Matching Skills</h4>
                      {skillGapResult.matching_skills?.map((s, i) => <span key={i} className="skill-tag green">{s}</span>)}
                    </div>
                    <div className="skill-col skill-need">
                      <h4>❌ Missing Skills</h4>
                      {skillGapResult.missing_skills?.map((s, i) => <span key={i} className="skill-tag red">{s}</span>)}
                    </div>
                  </div>
                  <div className="skill-recommendations">
                    <h4>💡 Recommendations</h4>
                    {skillGapResult.recommendations?.map((r, i) => <p key={i}>• {r}</p>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'score' && (
            <div>
              <input type="file" accept=".pdf" onChange={e => setScoreFile(e.target.files[0])} className="ai-file-input" />
              <p className="ai-or">— or paste your resume text —</p>
              <textarea value={scoreResume} onChange={e => setScoreResume(e.target.value)} placeholder="Paste resume text here..." rows={6} className="ai-textarea" />
              <button onClick={handleResumeScore} disabled={loading} className="ai-btn">
                {loading ? 'Scoring...' : '💯 Score My Resume'}
              </button>
              {scoreResult && (
                <div className="score-results">
                  <div className="overall-score">
                    <div className="big-score" style={{ color: scoreResult.overall_score >= 80 ? '#22c55e' : scoreResult.overall_score >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {scoreResult.overall_score}
                    </div>
                    <p>/ 100</p>
                  </div>
                  <div className="score-categories">
                    {scoreResult.categories?.map((cat, i) => (
                      <div key={i} className="score-cat">
                        <div className="score-cat-header">
                          <span>{cat.name}</span>
                          <span className="score-cat-num">{cat.score}/100</span>
                        </div>
                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width: `${cat.score}%`, backgroundColor: cat.score >= 80 ? '#22c55e' : cat.score >= 60 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <p className="score-cat-feedback">{cat.feedback}</p>
                      </div>
                    ))}
                  </div>
                  <div className="score-improvements">
                    <h4>🚀 Top Improvements</h4>
                    {scoreResult.top_improvements?.map((tip, i) => <p key={i}>• {tip}</p>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {result && !jobMatches && !skillGapResult && !scoreResult && (
            <div className="ai-result">
              <pre>{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITools;