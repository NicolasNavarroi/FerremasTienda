// src/context/CartContexto.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find(p => p.idProducto === item.idProducto);
      if (existing) {
        return prevCart.map(p =>
          p.idProducto === item.idProducto
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.idProducto === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.idProducto !== productId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      } else {
        setCart([]);
      }
    } catch (err) {
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
