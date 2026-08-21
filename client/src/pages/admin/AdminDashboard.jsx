import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import '../owner/OwnerPages.css';

export default function AdminDashboard() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    api
      .getPendingPackages()
      .then(setPackages)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    setActionError('');
    try {
      await api.approvePackage(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not approve package.');
    }
  };

  const confirmReject = async (id) => {
    setActionError('');
    try {
      await api.rejectPackage(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not reject package.');
    }
  };

  return (
    <div className="container section">
      <div className="section__header">
        <h1 className="section__title">Pending Approvals</h1>
        <p className="eyebrow">{packages.length} awaiting review</p>
      </div>

      {actionError && <p className="owner-error">{actionError}</p>}

      {loading ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : packages.length === 0 ? (
        <p className="owner-empty">Nothing pending review right now.</p>
      ) : (
        <div className="owner-table">
          {packages.map((pkg) => (
            <div key={pkg._id} className="owner-row tear-line" style={{ gridTemplateColumns: '90px 1fr auto' }}>
              <img src={pkg.images?.[0]} alt={pkg.title} className="owner-row__img" />
              <div className="owner-row__info">
                <p className="owner-row__title">
                  <Link to={`/packages/${pkg._id}`} target="_blank" rel="noreferrer">{pkg.title}</Link>
                </p>
                <p className="owner-row__meta">
                  {pkg.location} · {pkg.duration} · by {pkg.owner?.name} ({pkg.owner?.email})
                </p>
              </div>

              {rejectingId === pkg._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 240 }}>
                  <input
                    placeholder="Reason for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 13 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="owner-btn owner-btn--danger" onClick={() => confirmReject(pkg._id)}>Confirm Reject</button>
                    <button className="owner-btn" onClick={() => setRejectingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="owner-row__actions">
                  <button className="owner-btn owner-btn--primary" onClick={() => handleApprove(pkg._id)}>Approve</button>
                  <button className="owner-btn owner-btn--danger" onClick={() => setRejectingId(pkg._id)}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
