import { useEffect, useState } from 'react';
import * as api from '../../services/api';
import './OwnerPages.css';

export default function ReceivedBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getReceivedOrders()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container section">
      <div className="section__header">
        <h1 className="section__title">Bookings Received</h1>
        <p className="eyebrow">{items.length} booking{items.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : items.length === 0 ? (
        <p className="owner-empty">No bookings yet on your packages.</p>
      ) : (
        <div className="data-table">
          {items.map((item) => (
            <div className="data-row tear-line" key={`${item.orderId}-${item.package?._id}`}>
              <img src={item.package?.images?.[0]} alt={item.package?.title} className="data-row__img" />
              <div>
                <p className="data-row__title">{item.package?.title}</p>
                <p className="data-row__sub">{item.package?.location} · Qty {item.quantity}</p>
              </div>
              <div>
                <p className="data-row__title" style={{ fontSize: 14 }}>{item.customer?.name}</p>
                <p className="data-row__sub">{item.customer?.email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="data-row__title" style={{ color: 'var(--ticket-red)' }}>
                  ₹{(item.quantity * item.priceAtBooking).toLocaleString('en-IN')}
                </p>
                <p className="data-row__sub">{new Date(item.orderedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
