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

  // ATS Score
    const [atsResume, setAtsResume] = useState('');
    const [atsJob, setAtsJob] = useState('');
    const [atsFile, setAtsFile] = useState(null);
    const [atsResult, setAtsResult] = useState(null);

    // Tailor Resume
    const [tailorResume, setTailorResume] = useState('');
    const [tailorJob, setTailorJob] = useState('');
    const [tailorFile, setTailorFile] = useState(null);
    const [tailorResult, setTailorResult] = useState(null);

  if (!app) return null;

  const extractPdfText = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetRole', app.role || 'Software Engineer');
    const res = await axios.post('/api/ai/upload-resume', formData);
    return res.data.text || res.data.feedback;
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
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('targetRole', app.role);
        const res = await axios.post('/api/ai/upload-resume', formData);
        setResult(res.data.feedback);
      } else {
        const res = await axios.post('/api/ai/resume-feedback', {
          resumeText: resumeText,
          targetRole: app.role
        });
        setResult(res.data.feedback);
      }
    } catch (err) {
      setResult('Error reviewing resume.');
    }
    setLoading(false);
  };

  const handleCoverLetter = async () => {
    setLoading(true);
    setResult('');
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('company', app.company);
        formData.append('role', app.role);
        const res = await axios.post('/api/ai/upload-resume-cover-letter', formData);
        setResult(res.data.coverLetter);
      } else {
        const res = await axios.post('/api/ai/cover-letter', {
          resumeText: coverLetterText,
          company: app.company,
          role: app.role
        });
        setResult(res.data.coverLetter);
      }
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

  const handleAtsScore = async () => {
      setLoading(true);
      setAtsResult(null);
      setResult('');
      try {
        let text = atsResume;
        if (atsFile) {
          const formData = new FormData();
          formData.append('file', atsFile);
          formData.append('targetRole', app.role);
          const uploadRes = await axios.post('/api/ai/upload-resume', formData);
          text = uploadRes.data.text || uploadRes.data.feedback;
        }
        const res = await axios.post('/api/ai/ats-score', {
          resumeText: text,
          jobDescription: atsJob
        });
        const parsed = parseJSON(res.data.result);
        if (parsed) {
          setAtsResult(parsed);
        } else {
          setResult(res.data.result);
        }
      } catch (err) {
        setResult('Error analyzing ATS score.');
      }
      setLoading(false);
    };

    const handleTailorResume = async () => {
      setLoading(true);
      setTailorResult(null);
      setResult('');
      try {
        let text = tailorResume;
        if (tailorFile) {
          const formData = new FormData();
          formData.append('file', tailorFile);
          formData.append('targetRole', app.role);
          const uploadRes = await axios.post('/api/ai/upload-resume', formData);
          text = uploadRes.data.text || uploadRes.data.feedback;
        }
        const res = await axios.post('/api/ai/tailor-resume', {
          resumeText: text,
          jobDescription: tailorJob
        });
        const parsed = parseJSON(res.data.result);
        if (parsed) {
          setTailorResult(parsed);
        } else {
          setResult(res.data.result);
        }
      } catch (err) {
        setResult('Error tailoring resume.');
      }
      setLoading(false);
    };

  const tabs = [
      { id: 'interview', label: '🎯 Interview' },
      { id: 'resume', label: '📝 Resume Review' },
      { id: 'cover', label: '✉️ Cover Letter' },
      { id: 'jobmatch', label: '🔍 Job Match' },
      { id: 'skillgap', label: '📊 Skill Gap' },
      { id: 'score', label: '💯 Resume Score' },
      { id: 'ats', label: '🔎 ATS Score' },
      { id: 'tailor', label: '✂️ Tailor Resume' }
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
              onClick={() => { setActiveTab(tab.id); setResult(''); setJobMatches(null); setSkillGapResult(null); setScoreResult(null); setAtsResult(null); setTailorResult(null); }}
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
              <button onClick={handleResumeReview} disabled={loading} className="ai-btn">
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

          {activeTab === 'ats' && (
                      <div>
                        <input type="file" accept=".pdf" onChange={e => setAtsFile(e.target.files[0])} className="ai-file-input" />
                        <p className="ai-or">— or paste your resume text —</p>
                        <textarea value={atsResume} onChange={e => setAtsResume(e.target.value)} placeholder="Paste resume text here..." rows={4} className="ai-textarea" />
                        <textarea value={atsJob} onChange={e => setAtsJob(e.target.value)} placeholder="Paste the job description here..." rows={4} className="ai-textarea" style={{ marginTop: '10px' }} />
                        <button onClick={handleAtsScore} disabled={loading || (!atsFile && !atsResume) || !atsJob} className="ai-btn">
                          {loading ? 'Scanning...' : '🔎 Check ATS Score'}
                        </button>
                        {atsResult && (
                          <div className="ats-results">
                            <div className="ats-score-display">
                              <div className="ats-score-circle" style={{ '--ats-color': atsResult.ats_score >= 80 ? '#22c55e' : atsResult.ats_score >= 60 ? '#f59e0b' : '#ef4444' }}>
                                <span className="ats-score-num">{atsResult.ats_score}</span>
                                <span className="ats-score-label">ATS Score</span>
                              </div>
                              <p className="ats-summary">{atsResult.summary}</p>
                            </div>
                            <div className="ats-keywords">
                              <div className="ats-keyword-col">
                                <h4>Matched Keywords</h4>
                                <div className="ats-tags">
                                  {atsResult.matched_keywords?.map((k, i) => <span key={i} className="ats-tag matched">{k}</span>)}
                                </div>
                              </div>
                              <div className="ats-keyword-col">
                                <h4>Missing Keywords</h4>
                                <div className="ats-tags">
                                  {atsResult.missing_keywords?.map((k, i) => <span key={i} className="ats-tag missing">{k}</span>)}
                                </div>
                              </div>
                            </div>
                            <div className="ats-sections">
                              <h4>Section Breakdown</h4>
                              {atsResult.section_scores?.map((sec, i) => (
                                <div key={i} className="ats-section-item">
                                  <div className="ats-section-header">
                                    <span>{sec.section}</span>
                                    <span className="ats-section-score" style={{ color: sec.score >= 80 ? '#22c55e' : sec.score >= 60 ? '#f59e0b' : '#ef4444' }}>{sec.score}%</span>
                                  </div>
                                  <div className="ats-bar-track"><div className="ats-bar-fill" style={{ width: `${sec.score}%`, backgroundColor: sec.score >= 80 ? '#22c55e' : sec.score >= 60 ? '#f59e0b' : '#ef4444' }} /></div>
                                  <p className="ats-section-feedback">{sec.feedback}</p>
                                </div>
                              ))}
                            </div>
                            <div className="ats-improvements">
                              <h4>How to Improve</h4>
                              {atsResult.improvements?.map((tip, i) => <p key={i}>• {tip}</p>)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'tailor' && (
                      <div>
                        <input type="file" accept=".pdf" onChange={e => setTailorFile(e.target.files[0])} className="ai-file-input" />
                        <p className="ai-or">— or paste your resume text —</p>
                        <textarea value={tailorResume} onChange={e => setTailorResume(e.target.value)} placeholder="Paste resume text here..." rows={4} className="ai-textarea" />
                        <textarea value={tailorJob} onChange={e => setTailorJob(e.target.value)} placeholder="Paste the job description you want to tailor for..." rows={4} className="ai-textarea" style={{ marginTop: '10px' }} />
                        <button onClick={handleTailorResume} disabled={loading || (!tailorFile && !tailorResume) || !tailorJob} className="ai-btn">
                          {loading ? 'Tailoring...' : '✂️ Tailor My Resume'}
                        </button>
                        {tailorResult && (
                          <div className="tailor-results">
                            <div className="tailor-score-compare">
                              <div className="tailor-before">
                                <span className="tailor-score-num" style={{ color: '#ef4444' }}>{tailorResult.before_score}</span>
                                <span>Before</span>
                              </div>
                              <div className="tailor-arrow">→</div>
                              <div className="tailor-after">
                                <span className="tailor-score-num" style={{ color: '#22c55e' }}>{tailorResult.after_score}</span>
                                <span>After</span>
                              </div>
                            </div>

                            <div className="tailor-section">
                              <h4>Tailored Professional Summary</h4>
                              <div className="tailor-box">{tailorResult.tailored_summary}</div>
                            </div>

                            <div className="tailor-section">
                              <h4>Tailored Experience Bullets</h4>
                              {tailorResult.tailored_experience?.map((item, i) => (
                                <div key={i} className="tailor-compare">
                                  <div className="tailor-original">
                                    <span className="tailor-label">Original</span>
                                    <p>{item.original}</p>
                                  </div>
                                  <div className="tailor-tailored">
                                    <span className="tailor-label">Tailored</span>
                                    <p>{item.tailored}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="tailor-section">
                              <h4>Keywords Added</h4>
                              <div className="tailor-keywords">
                                {tailorResult.keywords_added?.map((k, i) => <span key={i} className="ats-tag matched">{k}</span>)}
                              </div>
                            </div>

                            <div className="tailor-section">
                              <h4>Recommended Skills Section</h4>
                              <div className="tailor-keywords">
                                {tailorResult.tailored_skills?.map((s, i) => <span key={i} className="skill-tag green">{s}</span>)}
                              </div>
                            </div>

                            <div className="tailor-section">
                              <h4>Additional Tips</h4>
                              {tailorResult.tips?.map((tip, i) => <p key={i}>• {tip}</p>)}
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