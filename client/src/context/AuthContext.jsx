import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists from a previous session, validate it and load the user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((data) => setUser(data))
      .catch(() => {
        // Token expired/invalid: clear it silently
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('token', token);
    setUser(user);
    // Full reload so CartContext re-establishes its socket connection under the
    // logged-in user's ownerId instead of the guest session it started with.
    window.location.href = '/';
  }, []);

  const signup = useCallback(async (name, email, password, role) => {
    const { token, user } = await api.signup({ name, email, password, role });
    localStorage.setItem('token', token);
    setUser(user);
    window.location.href = '/';
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    window.location.href = '/';
  }, []);

  const value = { user, loading, login, signup, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
