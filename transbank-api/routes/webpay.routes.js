const express = require('express');
const router = express.Router();
const webpayController = require('../controllers/webpay.controllers');

// Validación de parámetros para creación
const validateCreateParams = (req, res, next) => {
  const { buy_order, session_id, amount, return_url } = req.body;
  if (!buy_order || !session_id || !amount || !return_url) {
    return res.status(400).json({
      error: 'Parámetros faltantes',
      details: {
        required: ['buy_order', 'session_id', 'amount', 'return_url'],
        received: req.body
      }
    });
  }
  next();
};

// Validación de parámetros para commit (ahora acepta GET y POST)
const validateCommitParams = (req, res, next) => {
  const token = req.body.token || req.query.token_ws;
  if (!token) {
    return res.status(400).json({
      error: 'Token es requerido',
      details: {
        required: ['token (body) o token_ws (query)'],
        received: {
          body: req.body,
          query: req.query
        }
      }
    });
  }
  next();
};

router.post('/create', validateCreateParams, webpayController.createTransaction);
router.route('/commit')
  .get(validateCommitParams, webpayController.commitTransaction)  // <- Nuevo
  .post(validateCommitParams, webpayController.commitTransaction);
router.get('/status/:token', webpayController.getTransactionStatus);

module.exports = router;