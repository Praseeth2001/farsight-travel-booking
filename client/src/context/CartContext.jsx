import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const socketReady = useRef(false);

  const applyCartPayload = useCallback((payload) => {
    setItems(payload.items || []);
    setTotalCount(payload.totalCount || 0);
    setTotalPrice(payload.totalPrice || 0);
  }, []);

  // Initial load: fetch cart via REST, then open the socket using the returned ownerId
  useEffect(() => {
    let cancelled = false;

    api
      .getCart()
      .then((payload) => {
        if (cancelled) return;
        applyCartPayload(payload);
        setLoading(false);

        if (!socketReady.current && payload.ownerId) {
          const socket = connectSocket(payload.ownerId);
          socketReady.current = true;

          // Server pushes this event any time the cart changes (this tab or another)
          socket.on('cart:update', (updatedPayload) => {
            applyCartPayload(updatedPayload);
          });

          // If we reconnect after a drop, re-sync via REST in case events were missed
          socket.on('connect', () => {
            api.getCart().then(applyCartPayload).catch(() => {});
          });
        }
      })
      .catch(() => setLoading(false));

    return () => {
      cancelled = true;
      disconnectSocket();
      socketReady.current = false;
    };
  }, [applyCartPayload]);

  const addItem = useCallback(
    async (packageId, quantity = 1) => {
      const payload = await api.addToCart(packageId, quantity);
      applyCartPayload(payload); // socket event will also arrive and confirm, this just feels instant
      return payload;
    },
    [applyCartPayload]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      const payload = await api.updateCartItem(itemId, quantity);
      applyCartPayload(payload);
      return payload;
    },
    [applyCartPayload]
  );

  const removeItem = useCallback(
    async (itemId) => {
      const payload = await api.removeCartItem(itemId);
      applyCartPayload(payload);
      return payload;
    },
    [applyCartPayload]
  );

  const value = {
    items,
    totalCount,
    totalPrice,
    loading,
    addItem,
    updateItem,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
