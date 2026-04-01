import React, { useState } from 'react';
import axios from 'axios';

const AITools = ({ app, onClose }) => {
  const [activeTab, setActiveTab] = useState('interview');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Interview
  const [questionType, setQuestionType] = useState('technical');
  const [numQuestions, setNumQuestions] = useState(5);

  // Shared resume (upload once, use everywhere)
    const [sharedResumeFile, setSharedResumeFile] = useState(null);
    const [sharedResumeText, setSharedResumeText] = useState('');
    const [resumeExtracted, setResumeExtracted] = useState(false);

    // Results
    const [skillGapResult, setSkillGapResult] = useState(null);
    const [jobMatches, setJobMatches] = useState(null);
    const [scoreResult, setScoreResult] = useState(null);
    const [atsResult, setAtsResult] = useState(null);
    const [tailorResult, setTailorResult] = useState(null);


  if (!app) return null;

  const getResumeText = async () => {
      if (sharedResumeText) return sharedResumeText;
      if (sharedResumeFile) {
        const formData = new FormData();
        formData.append('file', sharedResumeFile);
        formData.append('targetRole', app.role || 'Software Engineer');
        const res = await axios.post('/api/ai/upload-resume', formData);
        const text = res.data.text || res.data.feedback;
        setSharedResumeText(text);
        setResumeExtracted(true);
        return text;
      }
      return null;
    };

    const getJobDescription = () => {
      return app.notes || '';
    };

  const parseJSON = (text) => {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  };

  const handleInterview

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

          {/* Shared Resume Upload Bar */}
          <div className="shared-resume-bar">
            <div className="shared-resume-left">
              <span className="shared-resume-label">Your Resume:</span>
              {sharedResumeFile ? (
                <span className="shared-resume-name">✅ {sharedResumeFile.name}</span>
              ) : sharedResumeText ? (
                <span className="shared-resume-name">✅ Resume text loaded</span>
              ) : (
                <span className="shared-resume-name" style={{color: '#94a3b8'}}>No resume uploaded</span>
              )}
            </div>
            <div className="shared-resume-actions">
              <input type="file" accept=".pdf" id="shared-resume-upload" onChange={e => { setSharedResumeFile(e.target.files[0]); setResumeExtracted(false); setSharedResumeText(''); }} className="hidden-file-input" />
              <label htmlFor="shared-resume-upload" className="shared-upload-btn">
                {sharedResumeFile ? 'Change PDF' : 'Upload PDF'}
              </label>
              {(sharedResumeFile || sharedResumeText) && (
                <button onClick={() => { setSharedResumeFile(null); setSharedResumeText(''); setResumeExtracted(false); }} className="shared-clear-btn">Clear</button>
              )}
            </div>
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
                {!sharedResumeFile && !sharedResumeText && (
                  <>
                    <p className="ai-or">Paste your resume text below (or upload a PDF above)</p>
                    <textarea value={sharedResumeText} onChange={e => setSharedResumeText(e.target.value)} placeholder="Paste resume text here..." rows={6} className="ai-textarea" />
                  </>
                )}
                <button onClick={handleResumeReview} disabled={loading || (!sharedResumeFile && !sharedResumeText)} className="ai-btn">
                  {loading ? 'Analyzing...' : 'Review Resume'}
                </button>
              </div>
            )}

            {activeTab === 'cover' && (
              <div>
                {!sharedResumeFile && !sharedResumeText && (
                  <>
                    <p className="ai-or">Paste your resume/details below (or upload a PDF above)</p>
                    <textarea value={sharedResumeText} onChange={e => setSharedResumeText(e.target.value)} placeholder="Paste resume or key details..." rows={6} className="ai-textarea" />
                  </>
                )}
                <button onClick={handleCoverLetter} disabled={loading || (!sharedResumeFile && !sharedResumeText)} className="ai-btn">
                  {loading ? 'Writing...' : 'Generate Cover Letter'}
                </button>
              </div>
            )}

            {activeTab === 'jobmatch' && (
              <div>
                {!sharedResumeFile && !sharedResumeText && (
                  <>
                    <p className="ai-or">Paste your resume text below (or upload a PDF above)</p>
                    <textarea value={sharedResumeText} onChange={e => setSharedResumeText(e.target.value)} placeholder="Paste resume text here..." rows={6} className="ai-textarea" />
                  </>
                )}
                <button onClick={handleJobMatch} disabled={loading || (!sharedResumeFile && !sharedResumeText)} className="ai-btn">
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
                {!sharedResumeFile && !sharedResumeText && (
                  <>
                    <p className="ai-or">Paste your resume text below (or upload a PDF above)</p>
                    <textarea value={sharedResumeText} onChange={e => setSharedResumeText(e.target.value)} placeholder="Paste resume text here..." rows={4} className="ai-textarea" />
                  </>
                )}
                {!getJobDescription() && (
                  <textarea value={sharedResumeText} onChange={e => {}} placeholder="Job description auto-loaded from application notes" rows={4} className="ai-textarea" style={{ marginTop: '10px', display: 'none' }} />
                )}
                <div className="auto-filled-info">
                  <span>Job Description: </span>
                  {getJobDescription() ? <span className="auto-tag">Auto-filled from job details</span> : <span style={{color:'#ef4444'}}>No job description saved. Add notes to the job card.</span>}
                </div>
                <button onClick={handleSkillGap} disabled={loading || (!sharedResumeFile && !sharedResumeText) || !getJobDescription()} className="ai-btn">
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
                        <h4>Matching Skills</h4>
                        {skillGapResult.matching_skills?.map((s, i) => <span key={i} className="skill-tag green">{s}</span>)}
                      </div>
                      <div className="skill-col skill-need">
                        <h4>Missing Skills</h4>
                        {skillGapResult.missing_skills?.map((s, i) => <span key={i} className="skill-tag red">{s}</span>)}
                      </div>
                    </div>
                    <div className="skill-recommendations">
                      <h4>Recommendations</h4>
                      {skillGapResult.recommendations?.map((r, i) => <p key={i}>• {r}</p>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'score' && (
              <div>
                {!sharedResumeFile && !sharedResumeText && (
                  <>
                    <p className="ai-or">Paste your resume text below (or upload a PDF above)</p>
                    <textarea value={sharedResumeText} onChange={e => setSharedResumeText(e.target.value)} placeholder="Paste resume text here..." rows={6} className="ai-textarea" />
                  </>
                )}
                <button onClick={handleResumeScore} disabled={loading || (!sharedResumeFile && !sharedResumeText)} className="ai-btn">
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
                      <h4>Top Improvements</h4>
                      {scoreResult.top_improvements?.map((tip, i) => <p key={i}>• {tip}</p>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ats' && (
              <div>
                {!sharedResumeFile && !sharedResumeText && (
                  <>
                    <p className="ai-or">Paste your resume text below (or upload a PDF above)</p>
                    <textarea value={sharedResumeText} onChange={e => setSharedResumeText(e.target.value)} placeholder="Paste resume text here..." rows={4} className="ai-textarea" />
                  </>
                )}
                <div className="auto-filled-info">
                  <span>Job Description: </span>
                  {getJobDescription() ? <span className="auto-tag">Auto-filled from job details</span> : <span style={{color:'#ef4444'}}>No job description saved. Add notes to the job card.</span>}
                </div>
                <button onClick={handleAtsScore} disabled={loading || (!sharedResumeFile && !sharedResumeText) || !getJobDescription()} className="ai-btn">
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
                {!sharedResumeFile && !sharedResumeText && (
                  <>
                    <p className="ai-or">Paste your resume text below (or upload a PDF above)</p>
                    <textarea value={sharedResumeText} onChange={e => setSharedResumeText(e.target.value)} placeholder="Paste resume text here..." rows={4} className="ai-textarea" />
                  </>
                )}
                <div className="auto-filled-info">
                  <span>Job Description: </span>
                  {getJobDescription() ? <span className="auto-tag">Auto-filled from job details</span> : <span style={{color:'#ef4444'}}>No job description saved. Add notes to the job card.</span>}
                </div>
                <button onClick={handleTailorResume} disabled={loading || (!sharedResumeFile && !sharedResumeText) || !getJobDescription()} className="ai-btn">
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
                      <h4>Recommended Skills</h4>
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

            {result && !jobMatches && !skillGapResult && !scoreResult && !atsResult && !tailorResult && (
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