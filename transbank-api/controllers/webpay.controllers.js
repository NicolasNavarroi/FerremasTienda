const { configureWebpay } = require('../config/transbank.config');

const createTransaction = async (req, res) => {
  try {
    const { buy_order, session_id, amount, return_url } = req.body;
    
    if (!buy_order || !session_id || !amount || !return_url) {
      throw new Error('Faltan parámetros requeridos');
    }

    if (amount <= 0) {
      throw new Error('El monto debe ser mayor que cero');
    }

    const tx = configureWebpay();
    const response = await tx.create(buy_order, session_id, amount, return_url);

    res.json({
      success: true,
      token: response.token,
      url: `${response.url}?token_ws=${response.token}`,
      details: {
        buy_order,
        amount,
        created_at: new Date()
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack
      } : undefined
    });
  }
};

const commitTransaction = async (req, res) => {
  try {
    const token = req.body.token || req.query.token_ws;
    
    if (!token) {
      throw new Error('Token no proporcionado');
    }

    const tx = configureWebpay();
    const response = await tx.commit(token);

    // Detección de pago rechazado (tarjeta de prueba)
    if (response.status === "INITIALIZED" && response.card_detail?.card_number === "0568") {
      return res.json({
        success: false,
        status: "REJECTED",
        message: "Pago rechazado por el banco emisor (tarjeta de prueba 5186...0568)",
        test_environment: true,
        details: response
      });
    }

    res.json({
      success: true,
      status: response.status,
      details: response
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack
      } : undefined
    });
  }
};

const getTransactionStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const tx = configureWebpay();
    const response = await tx.status(token);

    // Detección especial para tarjeta de prueba rechazada
    if (response.status === "INITIALIZED" && response.card_detail?.card_number === "0568") {
      return res.json({
        success: false,
        status: "REJECTED",
        message: "Transacción rechazada",
        test_environment: true,
        details: response
      });
    }

    res.json({
      success: true,
      status: response.status,
      details: response
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack
      } : undefined
    });
  }
};

module.exports = {
  createTransaction,
  commitTransaction,
  getTransactionStatus
};