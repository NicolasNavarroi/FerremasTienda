const { body } = require('express-validator');

const validateRegister = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3 }).withMessage('Debe tener al menos 3 caracteres'),
  
  body('email')
    .isEmail().withMessage('Debe ser un email válido'),
  
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Debe ser un email válido'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

module.exports = { validateRegister, validateLogin };