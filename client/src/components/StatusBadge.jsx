import './StatusBadge.css';

const LABELS = {
  draft: 'Draft',
  pending: 'Pending Review',
  published: 'Published',
  rejected: 'Rejected',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{LABELS[status] || status}</span>;
}
