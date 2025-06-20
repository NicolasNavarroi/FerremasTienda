import axios from 'axios';

// Configuración base de axios (actualizada a /transbank)
const transbankApi = axios.create({
  baseURL: 'http://localhost:3000/transbank', // Cambiado de /api a /transbank
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs (opcional)
transbankApi.interceptors.request.use((config) => {
  console.log(`Enviando petición a: ${config.url}`);
  return config;
});

export const webpayService = {
  // Crear transacción Webpay
  createTransaction: async (buyOrder, amount, returnUrl) => {
    try {
      const response = await transbankApi.post('/webpay/create', {
        buyOrder,
        amount,
        returnUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear transacción:', error);
      throw error;
    }
  },

  // Confirmar transacción Webpay
  commitTransaction: async (token) => {
    try {
      const response = await transbankApi.post('/webpay/commit', { token });
      return response.data;
    } catch (error) {
      console.error('Error al confirmar transacción:', error);
      throw error;
    }
  },

  // Verificar estado de transacción
  getTransactionStatus: async (token) => {
    try {
      const response = await transbankApi.get(`/webpay/status/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar estado:', error);
      throw error;
    }
  },

  // Verificar salud del servidor (actualizado a /transbank/ping)
  ping: async () => {
    try {
      const response = await transbankApi.get('/ping');
      return response.data;
    } catch (error) {
      console.error('Error en ping:', error);
      throw error;
    }
  },
};