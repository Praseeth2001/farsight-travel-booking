import { Link } from 'react-router-dom';
import './CategoryGrid.css';

export default function CategoryGrid({ categories }) {
  return (
    <div className="category-grid">
      {categories.map((cat) => (
        <Link to={`/packages?category=${cat.slug}`} className="category-tile" key={cat._id}>
          <span className="category-tile__icon">{cat.icon}</span>
          <span className="category-tile__name">{cat.name}</span>
          <span className="category-tile__code eyebrow">{cat.slug.slice(0, 3).toUpperCase()}</span>
        </Link>
      ))}
    </div>
  );
}
