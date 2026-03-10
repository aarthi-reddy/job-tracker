import React from 'react';
import { FiEdit2, FiTrash2, FiExternalLink, FiCpu } from 'react-icons/fi';

const COLUMNS = [
  { status: 'APPLIED', label: 'Applied', color: '#3b82f6' },
  { status: 'PHONE_SCREEN', label: 'Phone Screen', color: '#f59e0b' },
  { status: 'TECHNICAL', label: 'Technical', color: '#8b5cf6' },
  { status: 'ONSITE', label: 'Onsite', color: '#ec4899' },
  { status: 'OFFER', label: 'Offer', color: '#10b981' },
  { status: 'REJECTED', label: 'Rejected', color: '#ef4444' },
];

function JobBoard({ applications, onUpdateStatus, onEdit, onDelete, onAI }) {
  return (
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
  );
}

export default JobBoard;