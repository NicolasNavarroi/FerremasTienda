const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { authMiddleware, checkRole } = require('../middlewares');

// Rutas públicas
router.get('/', productoController.listarProductos);
router.get('/:id', productoController.obtenerProducto);

// Rutas protegidas para admin y trabajadores
router.post('/', 
  authMiddleware, 
  checkRole([1, 2]), // Admin y Trabajadores
  productoController.crearProducto
);

router.put('/:id', 
  authMiddleware, 
  checkRole([1, 2]),
  productoController.actualizarProducto
);

router.delete('/:id', 
  authMiddleware, 
  checkRole([1, 2]),
  productoController.eliminarProducto
);

// Ruta especial para actualizar stock
router.patch('/:id/stock', 
  authMiddleware, 
  checkRole([1, 2]),
  productoController.actualizarStock
);

module.exports = router;