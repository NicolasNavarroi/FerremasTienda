// src/pages/client/CartPage.jsx
import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContexto';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './CartPageStyles.css'; // crea o usa este archivo si aún no existe

const WEBPAY_BASE_URL = "http://localhost:3001/transbank/webpay";

const CartPage = () => {
  const { cart, loading, error, fetchCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + (item.precio * (item.quantity || 1)),
    0
  );

  const handlePayment = async () => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");
      if (total <= 0) throw new Error("Carrito vacío");

      const response = await axios.post(`${WEBPAY_BASE_URL}/create`, {
        buy_order: `order_${Date.now()}`,
        session_id: `session_${user.id}_${Date.now()}`,
        amount: total,
        return_url: `${window.location.origin}/payment-result`
      });

      if (response.data?.url && response.data?.token) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.url;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = response.data.token;

        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || "Error al procesar pago");
    }
  };

  return (
    <div className="cart-container">
      <h2>Mi Carrito</h2>

      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : cart.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <>
        {cart.map(item => (
          <div key={item.idProducto} className="cart-item">
            <div className="item-info">
              <div>
                <h3>{item.nombre}</h3>
                <p>${item.precio.toLocaleString()} x {item.quantity}</p>
              </div>

              <div className="item-actions">
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.idProducto, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.idProducto, item.quantity + 1)}>+</button>
                </div>
                <button onClick={() => removeItem(item.idProducto)} className="btn-remove">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

          <div className="cart-total">
            <h3>Total: ${total.toLocaleString()}</h3>
          </div>

          <button
            onClick={handlePayment}
            className="pay-btn"
            disabled={loading || total <= 0}
          >
            Pagar con Webpay
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
