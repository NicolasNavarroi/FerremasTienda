const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware, checkRole } = require('../middlewares');

// Rutas públicas
router.post('/register', usuarioController.registrar);
router.post('/login', usuarioController.login);

// Rutas protegidas para clientes
router.get('/profile', authMiddleware, checkRole([3]), usuarioController.obtenerPerfil);
router.put('/profile', authMiddleware, checkRole([3]), usuarioController.actualizarPerfil);
router.delete('/account', authMiddleware, checkRole([3]), usuarioController.eliminarCuenta);

// Rutas protegidas para admin (gestión de trabajadores)
router.post('/admin/trabajadores', authMiddleware, checkRole([1]), usuarioController.crearTrabajador);
router.get('/admin/trabajadores', authMiddleware, checkRole([1]), usuarioController.listarTrabajadores);
router.put('/admin/trabajadores/:id', authMiddleware, checkRole([1]), usuarioController.actualizarTrabajador);
router.delete('/admin/trabajadores/:id', authMiddleware, checkRole([1]), usuarioController.eliminarTrabajador);

module.exports = router;