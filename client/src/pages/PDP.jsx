import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackageById } from '../services/api';
import { useCart } from '../context/CartContext';
import './PDP.css';

export default function PDP() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPackageById(id)
      .then((data) => {
        setPkg(data);
        setActiveImage(0);
      })
      .catch(() => setPkg(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(pkg._id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
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

  return (
    <div className="container section pdp">
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
            <p className="pdp__mono">{pkg.rating} ★ ({pkg.reviewCount})</p>
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

        <button className="pdp__cta" onClick={handleAddToCart} disabled={adding}>
          {justAdded ? 'Added to Cart ✓' : adding ? 'Adding…' : 'Add to Cart'}
        </button>

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
      </div>
    </div>
  );
}
