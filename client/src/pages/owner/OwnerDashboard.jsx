import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import * as api from '../../services/api';
import './OwnerPages.css';

export default function OwnerDashboard() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .getMyPackages()
      .then(setPackages)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (id) => {
    setActionError('');
    try {
      await api.submitForReview(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not submit package.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package? This cannot be undone.')) return;
    setActionError('');
    try {
      await api.deletePackage(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not delete package.');
    }
  };

  return (
    <div className="container section">
      <div className="section__header">
        <h1 className="section__title">My Packages</h1>
        <Link to="/owner/packages/new" className="owner-cta">+ Add Package</Link>
      </div>

      {actionError && <p className="owner-error">{actionError}</p>}

      {loading ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : packages.length === 0 ? (
        <p className="owner-empty">You haven't listed any packages yet.</p>
      ) : (
        <div className="owner-table">
          {packages.map((pkg) => (
            <div className="owner-row tear-line" key={pkg._id}>
              <img src={pkg.images?.[0]} alt={pkg.title} className="owner-row__img" />
              <div className="owner-row__info">
                <p className="owner-row__title">{pkg.title}</p>
                <p className="owner-row__meta">{pkg.location} · {pkg.duration}</p>
                {pkg.status === 'rejected' && pkg.rejectionReason && (
                  <p className="owner-row__reason">Reason: {pkg.rejectionReason}</p>
                )}
              </div>
              <StatusBadge status={pkg.status} />
              <div className="owner-row__actions">
                {pkg.status === 'draft' && (
                  <button className="owner-btn owner-btn--primary" onClick={() => handleSubmit(pkg._id)}>
                    Submit for Review
                  </button>
                )}
                <Link to={`/owner/packages/${pkg._id}/edit`} className="owner-btn">Edit</Link>
                <button className="owner-btn owner-btn--danger" onClick={() => handleDelete(pkg._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
