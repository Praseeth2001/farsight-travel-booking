import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import './Cart.css';

export default function Cart() {
  const { items, totalCount, totalPrice, loading, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setError('');

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    if (user.role !== 'tourist') {
      setError('Only tourist accounts can check out. Owner/admin accounts are for managing listings.');
      return;
    }

    setCheckingOut(true);
    try {
      await api.checkout();
      // Cart clears automatically via the socket 'cart:update' push from the backend
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section cart-empty">
        <p className="eyebrow">Cart</p>
        <h1 className="section__title">No bookings yet</h1>
        <p>Your cart is empty. Browse packages and add one to get started.</p>
        <Link to="/packages" className="cart-empty__cta">
          Browse Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section__header">
        <h1 className="section__title">Your Cart</h1>
        <p className="eyebrow">{totalCount} item{totalCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="cart-list">
        {items.map((item) => (
          <div className="cart-item tear-line" key={item._id}>
            <img src={item.package?.images?.[0]} alt={item.package?.title} className="cart-item__img" />

            <div className="cart-item__info">
              <p className="eyebrow">{item.package?.location}</p>
              <Link to={`/packages/${item.package?._id}`} className="cart-item__title">
                {item.package?.title}
              </Link>
              <p className="cart-item__mono">{item.package?.duration}</p>
            </div>

            <div className="cart-item__qty">
              <button onClick={() => updateItem(item._id, item.quantity - 1)} aria-label="Decrease quantity">
                −
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateItem(item._id, item.quantity + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>

            <p className="cart-item__price">₹{(item.quantity * item.priceAtAdd).toLocaleString('en-IN')}</p>

            <button className="cart-item__remove" onClick={() => removeItem(item._id)} aria-label="Remove item">
              Remove
            </button>
          </div>
        ))}
      </div>

      {error && <p className="cart-error">{error}</p>}

      <div className="cart-summary">
        <div>
          <p className="eyebrow">Total Fare</p>
          <p className="cart-summary__total">₹{totalPrice.toLocaleString('en-IN')}</p>
        </div>
        <button className="cart-summary__checkout" onClick={handleCheckout} disabled={checkingOut}>
          {checkingOut ? 'Booking…' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
}
