import { Link } from 'react-router-dom';
import './PackageCard.css';

export default function PackageCard({ pkg }) {
  const price = pkg.discountPrice || pkg.price;
  const hasDiscount = pkg.discountPrice && pkg.discountPrice < pkg.price;

  return (
    <Link to={`/packages/${pkg._id}`} className="ticket-card">
      <div className="ticket-card__image-wrap">
        <img src={pkg.images?.[0]} alt={pkg.title} loading="lazy" />
        <span className="ticket-card__category">{pkg.category?.name}</span>
      </div>

      <div className="ticket-card__stub tear-line">
        <div className="ticket-card__row">
          <div>
            <p className="eyebrow">Destination</p>
            <h3 className="ticket-card__title">{pkg.title}</h3>
            <p className="ticket-card__location">{pkg.location}</p>
          </div>
        </div>

        <div className="ticket-card__row ticket-card__row--footer">
          <div>
            <p className="eyebrow">Duration</p>
            <p className="ticket-card__mono">{pkg.duration}</p>
          </div>
          <div className="ticket-card__price-block">
            <p className="eyebrow">Fare</p>
            <p className="ticket-card__mono ticket-card__price">
              {hasDiscount && <span className="ticket-card__strike">₹{pkg.price.toLocaleString('en-IN')}</span>}
              ₹{price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
