import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // needed so the guest sessionId cookie is sent/received
});

export const getFeaturedPackages = () => api.get('/packages/featured').then((res) => res.data);

export const getPackages = (params = {}) => api.get('/packages', { params }).then((res) => res.data);

export const getPackageById = (id) => api.get(`/packages/${id}`).then((res) => res.data);

export const getCategories = () => api.get('/categories').then((res) => res.data);

export const getCart = () => api.get('/cart').then((res) => res.data);

export const addToCart = (packageId, quantity = 1) =>
  api.post('/cart', { packageId, quantity }).then((res) => res.data);

export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/item/${itemId}`, { quantity }).then((res) => res.data);

export const removeCartItem = (itemId) => api.delete(`/cart/item/${itemId}`).then((res) => res.data);

export default api;
