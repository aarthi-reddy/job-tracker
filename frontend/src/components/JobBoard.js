import React, { useState } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiExternalLink, FiCpu, FiFileText, FiUpload, FiDownload, FiX, FiEye } from 'react-icons/fi';

const API_URL = 'http://localhost:8080/api';

const COLUMNS = [
  { status: 'APPLIED', label: 'Applied', color: '#3b82f6' },
  { status: 'PHONE_SCREEN', label: 'Phone Screen', color: '#f59e0b' },
  { status: 'TECHNICAL', label: 'Technical', color: '#8b5cf6' },
  { status: 'ONSITE', label: 'Onsite', color: '#ec4899' },
  { status: 'OFFER', label: 'Offer', color: '#10b981' },
  { status: 'REJECTED', label: 'Rejected', color: '#ef4444' },
];

function JobBoard({ applications, onUpdateStatus, onEdit, onDelete, onAI, onRefresh }) {
  const [uploadingId, setUploadingId] = useState(null);
  const [showDocsId, setShowDocsId] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  const handleFileUpload = async (applicationId, file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    try {
      await axios.post(`${API_URL}/documents/upload/${applicationId}`, formData);
      onRefresh();
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploadingId(null);
  };

  const handleDelete = async (docId) => {
    try {
      await axios.delete(`${API_URL}/documents/${docId}`);
      onRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const docCount = (app) => app.documents ? app.documents.length : 0;

  return (
    <>
      {viewingDoc && (
        <div className="modal-overlay" onClick={() => setViewingDoc(null)}>
          <div className="pdf-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <div>
                <h3>{viewingDoc.fileName}</h3>
                <span className="pdf-viewer-type">{viewingDoc.fileType === 'resume' ? 'Resume' : 'Cover Letter'}</span>
              </div>
              <div className="pdf-viewer-actions">
                <a href={`${API_URL}/documents/download/${viewingDoc.id}`} className="pdf-download-btn">
                  <FiDownload /> Download
                </a>
                <button className="close-btn" onClick={() => setViewingDoc(null)}>
                  <FiX />
                </button>
              </div>
            </div>
            <iframe
              src={`${API_URL}/documents/download/${viewingDoc.id}`}
              className="pdf-iframe"
              title="Document Viewer"
            />
          </div>
        </div>
      )}

      <div className="board">
        {COLUMNS.map(col => {
          const apps = applications.filter(a => a.status === col.status);
          return (
            <div className="column" key={col.status}>
              <div className="column-header" style={{ borderTopColor: col.color }}>
                <h3>{col.label}</h3>
                <span className="count">{apps.length}</span>
              </div>
              <div className="column-body">
                {apps.map(app => (
                  <div className="card" key={app.id}>
                    <div className="card-header">
                      <h4>{app.company}</h4>
                      <div className="card-actions">
                        <button className="icon-btn ai" onClick={() => onAI(app)} title="AI Tools">
                          <FiCpu />
                        </button>
                        {app.jobUrl && (
                          <a href={app.jobUrl} target="_blank" rel="noreferrer" className="icon-btn">
                            <FiExternalLink />
                          </a>
                        )}
                        <button className="icon-btn" onClick={() => onEdit(app)}>
                          <FiEdit2 />
                        </button>
                        <button className="icon-btn delete" onClick={() => onDelete(app.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <p className="card-role">{app.role}</p>
                    {app.notes && <p className="card-notes">{app.notes}</p>}
                    <p className="card-date">{app.appliedDate?.split(' ')[0]}</p>

                    <div className="card-docs">
                      <div className="docs-header">
                        <button
                          className="docs-toggle"
                          onClick={() => setShowDocsId(showDocsId === app.id ? null : app.id)}
                        >
                          <FiFileText /> Docs {docCount(app) > 0 && <span className="doc-badge">{docCount(app)}</span>}
                        </button>
                        <button
                          className="docs-upload-btn"
                          onClick={() => setUploadingId(uploadingId === app.id ? null : app.id)}
                          title="Upload document"
                        >
                          <FiUpload />
                        </button>
                      </div>

                      {uploadingId === app.id && (
                        <div className="upload-options">
                          <label className="upload-option">
                            <FiFileText /> Resume
                            <input type="file" accept=".pdf" style={{ display: 'none' }}
                              onChange={(e) => e.target.files[0] && handleFileUpload(app.id, e.target.files[0], 'resume')} />
                          </label>
                          <label className="upload-option">
                            <FiFileText /> Cover Letter
                            <input type="file" accept=".pdf" style={{ display: 'none' }}
                              onChange={(e) => e.target.files[0] && handleFileUpload(app.id, e.target.files[0], 'cover_letter')} />
                          </label>
                        </div>
                      )}

                      {showDocsId === app.id && app.documents && app.documents.length > 0 && (
                        <div className="docs-list">
                          {app.documents.map(doc => (
                            <div className="doc-item" key={doc.id}>
                              <span className="doc-type">{doc.fileType === 'resume' ? 'Resume' : 'Cover Letter'}</span>
                              <span className="doc-name">{doc.fileName}</span>
                              <div className="doc-actions">
                                <button className="doc-action-btn" onClick={() => setViewingDoc(doc)} title="View">
                                  <FiEye />
                                </button>
                                <a href={`${API_URL}/documents/download/${doc.id}`} className="doc-action-btn" title="Download">
                                  <FiDownload />
                                </a>
                                <button className="doc-action-btn delete" onClick={() => handleDelete(doc.id)} title="Delete">
                                  <FiX />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showDocsId === app.id && (!app.documents || app.documents.length === 0) && (
                        <p className="no-docs">No documents uploaded yet</p>
                      )}
                    </div>

                    <div className="card-move">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                      >
                        {COLUMNS.map(c => (
                          <option key={c.status} value={c.status}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {apps.length === 0 && <p className="empty-col">No applications</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default JobBoard;