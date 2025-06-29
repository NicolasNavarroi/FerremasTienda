// src/routes/carritos.js
const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Ajuste correcto

// Ruta protegida con middleware
router.post('/agregar-item', authMiddleware, carritoController.agregarItem);

module.exports = router;
