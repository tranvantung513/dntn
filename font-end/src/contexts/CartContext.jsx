import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../api/cartApi';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const getGuestCart = () => {
    try {
      const stored = localStorage.getItem('guestCart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const saveGuestCart = (cart) => {
    localStorage.setItem('guestCart', JSON.stringify(cart));
  };

  const fetchCartCount = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      try {
        const res = await cartApi.getCart();
        let rawCart = res.data?.data || res.data?.content || res.data || [];
        if (!Array.isArray(rawCart)) {
          if (rawCart.items) rawCart = rawCart.items;
          else if (rawCart.cartItems) rawCart = rawCart.cartItems;
          else rawCart = [];
        }
        const total = rawCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } catch (err) {
        console.error("Lỗi get cart count", err);
      }
    } else {
      // Chế độ Guest
      const cart = getGuestCart();
      const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(total);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  const refreshCartCount = () => {
    fetchCartCount();
  };

  const addToCartContext = async (item, quantity) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      // User đã login -> Gọi thẳng Backend
      await cartApi.addItem({ productId: item.id, quantity });
      fetchCartCount();
    } else {
      // Guest lưu tạm vào LocalStorage
      const cart = getGuestCart();
      const existing = cart.find(x => x.productId === item.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        // Lưu kèm thông tin product gốc để ra trang chi tiết giỏ còn render được tên, ảnh, giá
        cart.push({ productId: item.id, quantity, product: item });
      }
      saveGuestCart(cart);
      fetchCartCount();
    }
  };

  const syncGuestCart = async () => {
    const cart = getGuestCart();
    if (cart.length > 0) {
       for (const item of cart) {
         try {
           await cartApi.addItem({ productId: item.productId, quantity: item.quantity });
         } catch(e) {
           console.error("Lỗi đồng bộ giỏ hàng offline -> online", e);
         }
       }
       localStorage.removeItem('guestCart');
       fetchCartCount();
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, addToCartContext, syncGuestCart, getGuestCart, saveGuestCart }}>
      {children}
    </CartContext.Provider>
  );
};
