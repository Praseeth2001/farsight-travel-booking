import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PackageCard from '../components/PackageCard';
import { getPackages, getCategories } from '../services/api';
import './PLP.css';

export default function PLP() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const page = Number(searchParams.get('page') || 1);

  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (activeCategory) params.category = activeCategory;

    getPackages(params)
      .then((res) => {
        setPackages(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, page]);

  const setCategory = (slug) => {
    const next = new URLSearchParams();
    if (slug) next.set('category', slug);
    next.set('page', '1');
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className="container section">
      <div className="section__header">
        <h1 className="section__title">All Packages</h1>
        <p className="eyebrow">{pagination ? `${pagination.total} routes available` : ''}</p>
      </div>

      <div className="plp-filters">
        <button className={!activeCategory ? 'is-active' : ''} onClick={() => setCategory('')}>
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={activeCategory === cat.slug ? 'is-active' : ''}
            onClick={() => setCategory(cat.slug)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="plp-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: 320 }} />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <p className="plp-empty">No packages match this route yet. Try another category.</p>
      ) : (
        <>
          <div className="plp-grid">
            {packages.map((pkg) => (
              <PackageCard pkg={pkg} key={pkg._id} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="plp-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                ‹ Prev
              </button>
              <span className="eyebrow">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
