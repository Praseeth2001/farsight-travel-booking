import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { totalCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) => (isActive ? 'is-active' : '');

  return (
    <header className="site-header">
      <div className="container site-header__row">
        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-mark">✈</span>
          <span className="site-header__logo-text">Farsight</span>
        </Link>

        <nav className="site-header__nav">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/packages" className={navLinkClass}>All Packages</NavLink>

          {user?.role === 'tourist' && (
            <NavLink to="/orders" className={navLinkClass}>My Bookings</NavLink>
          )}

          {user?.role === 'owner' && (
            <>
              <NavLink to="/owner/packages" className={navLinkClass}>My Packages</NavLink>
              <NavLink to="/owner/bookings" className={navLinkClass}>Bookings Received</NavLink>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin/pending" className={navLinkClass}>Pending Approvals</NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>Users</NavLink>
            </>
          )}
        </nav>

        <div className="site-header__actions">
          {/* Cart is only meaningful for guests and tourists, not owners/admins */}
          {(!user || user.role === 'tourist') && (
            <Link to="/cart" className="site-header__cart" aria-label={`Cart, ${totalCount} items`}>
              <span className="eyebrow">Cart</span>
              <span className="site-header__cart-badge">{totalCount}</span>
            </Link>
          )}

          {user ? (
            <div className="site-header__user">
              <span className="eyebrow site-header__user-name">{user.name}</span>
              <button className="site-header__logout" onClick={logout}>Log out</button>
            </div>
          ) : (
            <div className="site-header__auth-links">
              <button className="site-header__login" onClick={() => navigate('/login')}>Log in</button>
              <button className="site-header__signup" onClick={() => navigate('/signup')}>Sign up</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
