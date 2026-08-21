import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import './PDP.css';

export default function PDP() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getPackageById(id).catch(() => null),
      api.getPackageReviews(id).catch(() => []),
    ]).then(([pkgData, reviewData]) => {
      setPkg(pkgData);
      setReviews(reviewData);
      setActiveImage(0);
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = async () => {
    setCartError('');
    setAdding(true);
    try {
      await addItem(pkg._id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      setCartError(err.response?.data?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 420, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="container section">
        <p>This package could not be found.</p>
        <button onClick={() => navigate('/packages')}>Back to all packages</button>
      </div>
    );
  }

  const price = pkg.discountPrice || pkg.price;
  const hasDiscount = pkg.discountPrice && pkg.discountPrice < pkg.price;
  const canAddToCart = !user || user.role === 'tourist';
  const isOwnerOrAdminPreview = user && (user.role === 'admin' || (user.role === 'owner' && pkg.owner?._id === user.id)) && pkg.status !== 'published';

  return (
    <div className="container section pdp">
      {isOwnerOrAdminPreview && (
        <div className="pdp__preview-banner">
          <StatusBadge status={pkg.status} />
          <span>This package is not publicly visible yet — you're viewing it as a preview.</span>
          {pkg.status === 'rejected' && pkg.rejectionReason && <span> Reason: {pkg.rejectionReason}</span>}
        </div>
      )}

      <div className="pdp__gallery">
        <div className="pdp__gallery-main">
          <img src={pkg.images[activeImage]} alt={pkg.title} />
        </div>
        {pkg.images.length > 1 && (
          <div className="pdp__thumbs">
            {pkg.images.map((img, i) => (
              <button
                key={img}
                className={i === activeImage ? 'is-active' : ''}
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp__info">
        <p className="eyebrow">{pkg.category?.name} · {pkg.location}</p>
        <h1 className="pdp__title">{pkg.title}</h1>

        <div className="pdp__ticket-strip tear-line">
          <div>
            <p className="eyebrow">Duration</p>
            <p className="pdp__mono">{pkg.duration}</p>
          </div>
          <div>
            <p className="eyebrow">Rating</p>
            <p className="pdp__mono">{pkg.rating || '—'} ★ ({pkg.reviewCount})</p>
          </div>
          <div>
            <p className="eyebrow">Fare</p>
            <p className="pdp__mono pdp__price">
              {hasDiscount && <span className="pdp__strike">₹{pkg.price.toLocaleString('en-IN')}</span>}
              ₹{price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <p className="pdp__description">{pkg.description}</p>

        {canAddToCart ? (
          <>
            <button className="pdp__cta" onClick={handleAddToCart} disabled={adding}>
              {justAdded ? 'Added to Cart ✓' : adding ? 'Adding…' : 'Add to Cart'}
            </button>
            {cartError && <p className="pdp__cart-error">{cartError}</p>}
          </>
        ) : (
          <p className="pdp__owner-note eyebrow">Package owners and admins can't book packages.</p>
        )}

        {pkg.itinerary?.length > 0 && (
          <div className="pdp__block">
            <h2>Itinerary</h2>
            <ol className="pdp__itinerary">
              {pkg.itinerary.map((day) => (
                <li key={day.day}>
                  <span className="eyebrow">Day {day.day}</span>
                  <strong>{day.title}</strong>
                  <p>{day.description}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="pdp__block pdp__inclusions">
          {pkg.inclusions?.length > 0 && (
            <div>
              <h2>Included</h2>
              <ul>
                {pkg.inclusions.map((inc) => (
                  <li key={inc}>{inc}</li>
                ))}
              </ul>
            </div>
          )}
          {pkg.exclusions?.length > 0 && (
            <div>
              <h2>Not Included</h2>
              <ul>
                {pkg.exclusions.map((exc) => (
                  <li key={exc}>{exc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pdp__block pdp__reviews">
          <h2>Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
          {reviews.length === 0 ? (
            <p className="pdp__no-reviews">No reviews yet. Book this trip to be the first to review it.</p>
          ) : (
            <div className="pdp__review-list">
              {reviews.map((r) => (
                <div className="pdp__review" key={r._id}>
                  <div className="pdp__review-header">
                    <strong>{r.user?.name}</strong>
                    <span className="pdp__review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <span className="eyebrow">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
