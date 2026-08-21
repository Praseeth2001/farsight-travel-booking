import { useEffect, useState } from 'react';
import Carousel from '../components/Carousel';
import CategoryGrid from '../components/CategoryGrid';
import { getFeaturedPackages, getCategories } from '../services/api';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFeaturedPackages(), getCategories()])
      .then(([featuredData, categoryData]) => {
        setFeatured(featuredData);
        setCategories(categoryData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow hero__eyebrow">Boarding — Your Next Trip</p>
          <h1 className="hero__title">Book the journey. We'll handle the itinerary.</h1>
          <p className="hero__subtitle">
            Curated holiday packages with fixed fares, real itineraries, and no surprise stopovers.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="section__header">
          <h2 className="section__title">Popular Departures</h2>
          <p className="eyebrow">Featured this season</p>
        </div>
        {loading ? (
          <div className="skeleton-row">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 320, flex: '0 0 300px' }} />
            ))}
          </div>
        ) : (
          <Carousel packages={featured} />
        )}
      </section>

      <section className="container section">
        <div className="section__header">
          <h2 className="section__title">Browse by Category</h2>
          <p className="eyebrow">Pick your terminal</p>
        </div>
        {loading ? (
          <div className="skeleton-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 110, flex: '1' }} />
            ))}
          </div>
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </section>
    </div>
  );
}
