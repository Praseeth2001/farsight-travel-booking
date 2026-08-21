import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import './Orders.css';

function ReviewForm({ orderId, packageId, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.createReview({ orderId, packageId, rating, comment });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review.');
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {error && <p className="review-form__error">{error}</p>}
      <div className="review-form__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={n <= rating ? 'is-active' : ''}
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="How was the trip?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
      />
      <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</button>
    </form>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingKey, setReviewingKey] = useState(null); // `${orderId}-${packageId}`
  const [doneKeys, setDoneKeys] = useState(new Set());

  useEffect(() => {
    api
      .getMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container section cart-empty">
        <p className="eyebrow">My Bookings</p>
        <h1 className="section__title">No bookings yet</h1>
        <p>Once you book a package, it'll show up here.</p>
        <Link to="/packages" className="cart-empty__cta">Browse Packages</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section__header">
        <h1 className="section__title">My Bookings</h1>
        <p className="eyebrow">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card tear-line" key={order._id}>
            <div className="order-card__header">
              <span className="eyebrow">Booked {new Date(order.createdAt).toLocaleDateString()}</span>
              <span className="order-card__total">₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>

            {order.items.map((item) => {
              const key = `${order._id}-${item.package?._id}`;
              return (
                <div className="order-item" key={item._id}>
                  <img src={item.package?.images?.[0]} alt={item.package?.title} />
                  <div className="order-item__info">
                    <Link to={`/packages/${item.package?._id}`} className="order-item__title">
                      {item.package?.title}
                    </Link>
                    <p className="order-item__meta">
                      {item.package?.location} · Qty {item.quantity} · ₹{item.priceAtBooking.toLocaleString('en-IN')} each
                    </p>

                    {doneKeys.has(key) ? (
                      <p className="order-item__reviewed">✓ Review submitted</p>
                    ) : reviewingKey === key ? (
                      <ReviewForm
                        orderId={order._id}
                        packageId={item.package?._id}
                        onDone={() => {
                          setDoneKeys(new Set([...doneKeys, key]));
                          setReviewingKey(null);
                        }}
                      />
                    ) : (
                      <button className="order-item__review-btn" onClick={() => setReviewingKey(key)}>
                        Leave a review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
