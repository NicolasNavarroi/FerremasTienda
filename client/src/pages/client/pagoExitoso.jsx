// src/pages/client/pagoExitoso.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentResultStyles.css';

const PaymentResult = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    const confirmarPago = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token_ws');

      if (!token) {
        setMensaje('Token no recibido desde Webpay.');
        setStatus('ERROR');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post('http://localhost:3001/transbank/webpay/commit', { token });
        if (response.data.success) {
          setStatus('APROBADO');
          setMensaje('¡Pago exitoso! Gracias por tu compra.');
          setTransactionDetails(response.data.details || null);
        } else {
          setStatus('RECHAZADO');
          setMensaje(response.data.message || 'Pago rechazado.');
          setTransactionDetails(response.data.details || null);
        }
      } catch (error) {
        console.error('Error al confirmar pago:', error);
        setStatus('ERROR');
        setMensaje('Hubo un problema al confirmar el pago.');
      } finally {
        setLoading(false);
      }
    };

    confirmarPago();
  }, []);

  if (loading) return <p className="payment-result-container">Confirmando pago con Transbank...</p>;

  return (
    <div className="payment-result-container">
      <h1>Resultado del Pago</h1>

      <p className={status === 'APROBADO' ? 'success' : 'error'}>
        <strong>Estado:</strong> {status}
      </p>
      <p>{mensaje}</p>

      {transactionDetails && (
        <div className="details">
          <h2>Detalles de la Compra:</h2>
          <p><strong>Orden de Compra:</strong> {transactionDetails.buy_order}</p>
          <p><strong>Monto:</strong> ${transactionDetails.amount}</p>
          <p><strong>Fecha:</strong> {new Date(transactionDetails.transaction_date || transactionDetails.created_at).toLocaleString()}</p>
        </div>
      )}

      <button className="back-button" onClick={() => navigate('/')}>
        Volver al Inicio
      </button>
    </div>
  );
};

export default PaymentResult;
