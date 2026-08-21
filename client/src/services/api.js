import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the guest sessionId cookie when no JWT is present
});

// Attach the JWT (if logged in) to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Auth ----------
export const signup = (data) => api.post('/auth/signup', data).then((res) => res.data);
export const login = (data) => api.post('/auth/login', data).then((res) => res.data);
export const getMe = () => api.get('/auth/me').then((res) => res.data);

// ---------- Packages (public) ----------
export const getFeaturedPackages = () => api.get('/packages/featured').then((res) => res.data);
export const getPackages = (params = {}) => api.get('/packages', { params }).then((res) => res.data);
export const getPackageById = (id) => api.get(`/packages/${id}`).then((res) => res.data);
export const getCategories = () => api.get('/categories').then((res) => res.data);

// ---------- Packages (owner) ----------
export const getMyPackages = () => api.get('/packages/mine').then((res) => res.data);
export const createPackage = (data) => api.post('/packages', data).then((res) => res.data);
export const updatePackage = (id, data) => api.patch(`/packages/${id}`, data).then((res) => res.data);
export const deletePackage = (id) => api.delete(`/packages/${id}`).then((res) => res.data);
export const submitForReview = (id) => api.patch(`/packages/${id}/submit`).then((res) => res.data);

// ---------- Admin ----------
export const getPendingPackages = () => api.get('/admin/packages/pending').then((res) => res.data);
export const approvePackage = (id) => api.patch(`/admin/packages/${id}/approve`).then((res) => res.data);
export const rejectPackage = (id, reason) =>
  api.patch(`/admin/packages/${id}/reject`, { reason }).then((res) => res.data);
export const getAllPackagesAdmin = (status) =>
  api.get('/admin/packages', { params: status ? { status } : {} }).then((res) => res.data);
export const getUsers = () => api.get('/admin/users').then((res) => res.data);

// ---------- Cart ----------
export const getCart = () => api.get('/cart').then((res) => res.data);
export const addToCart = (packageId, quantity = 1) =>
  api.post('/cart', { packageId, quantity }).then((res) => res.data);
export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/item/${itemId}`, { quantity }).then((res) => res.data);
export const removeCartItem = (itemId) => api.delete(`/cart/item/${itemId}`).then((res) => res.data);

// ---------- Orders ----------
export const checkout = () => api.post('/orders/checkout').then((res) => res.data);
export const getMyOrders = () => api.get('/orders/mine').then((res) => res.data);
export const getReceivedOrders = () => api.get('/orders/received').then((res) => res.data);

// ---------- Reviews ----------
export const createReview = (data) => api.post('/reviews', data).then((res) => res.data);
export const getPackageReviews = (packageId) =>
  api.get(`/reviews/package/${packageId}`).then((res) => res.data);

export default api;
