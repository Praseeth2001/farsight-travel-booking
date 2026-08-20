import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header className="site-header">
      <div className="container site-header__row">
        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-mark">✈</span>
          <span className="site-header__logo-text">Farsight</span>
        </Link>

        <nav className="site-header__nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Home
          </NavLink>
          <NavLink to="/packages" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            All Packages
          </NavLink>
        </nav>

        <Link to="/cart" className="site-header__cart" aria-label={`Cart, ${totalCount} items`}>
          <span className="eyebrow">Cart</span>
          <span className="site-header__cart-badge">{totalCount}</span>
        </Link>
      </div>
    </header>
  );
}
