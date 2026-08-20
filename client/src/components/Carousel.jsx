import { useRef } from 'react';
import PackageCard from './PackageCard';
import './Carousel.css';

export default function Carousel({ packages }) {
  const trackRef = useRef(null);

  const scrollBy = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector('.carousel__item')?.offsetWidth || 320;
    track.scrollBy({ left: dir * (cardWidth + 20), behavior: 'smooth' });
  };

  return (
    <div className="carousel">
      <div className="carousel__track" ref={trackRef}>
        {packages.map((pkg) => (
          <div className="carousel__item" key={pkg._id}>
            <PackageCard pkg={pkg} />
          </div>
        ))}
      </div>

      <button className="carousel__nav carousel__nav--prev" onClick={() => scrollBy(-1)} aria-label="Previous">
        ‹
      </button>
      <button className="carousel__nav carousel__nav--next" onClick={() => scrollBy(1)} aria-label="Next">
        ›
      </button>
    </div>
  );
}
