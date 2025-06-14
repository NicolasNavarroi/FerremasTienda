const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/authValidators');

// Ruta de registro
router.post('/register', validateRegister, authController.register);

// Ruta de login
router.post('/login', validateLogin, authController.login);

// Ruta para verificar token
router.get('/verify', authController.verifyToken);

module.exports = router;