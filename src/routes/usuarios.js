const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', usuarioController.registrar);
router.post('/login', usuarioController.login);

// Middleware para verificar token en rutas protegidas
router.use(authMiddleware);

// Rutas para clientes (rol 3)
router.get('/profile', checkRole([3]), usuarioController.obtenerPerfil);
router.put('/profile', checkRole([3]), usuarioController.actualizarPerfil);
router.delete('/account', checkRole([3]), usuarioController.eliminarCuenta);

// Router para rutas de admin (rol 1)
const adminRouter = express.Router();
adminRouter.use(checkRole([1])); // Solo admins

// Gestión completa de usuarios
adminRouter.get('/users', usuarioController.listarUsuarios);
adminRouter.get('/users/:id', usuarioController.obtenerUsuario);
adminRouter.post('/users', usuarioController.crearUsuario);
adminRouter.put('/users/:id', usuarioController.actualizarUsuario);
adminRouter.delete('/users/:id', usuarioController.eliminarUsuario);

// Rutas específicas para trabajadores (mantenidas por compatibilidad)
adminRouter.get('/trabajadores', usuarioController.listarTrabajadores);
adminRouter.post('/trabajadores', usuarioController.crearTrabajador);

// Montar rutas de admin bajo /admin
router.use('/admin', adminRouter);

module.exports = router;