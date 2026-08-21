import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tourist' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card tear-line">
        <p className="eyebrow">Get started</p>
        <h1 className="auth-title">Create an Account</h1>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required autoFocus />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </label>

          <div className="auth-role-select">
            <p className="eyebrow">I am a…</p>
            <div className="auth-role-options">
              <label className={form.role === 'tourist' ? 'is-selected' : ''}>
                <input
                  type="radio"
                  name="role"
                  value="tourist"
                  checked={form.role === 'tourist'}
                  onChange={handleChange}
                />
                Tourist — I want to book trips
              </label>
              <label className={form.role === 'owner' ? 'is-selected' : ''}>
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={form.role === 'owner'}
                  onChange={handleChange}
                />
                Package Owner — I want to list trips
              </label>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
