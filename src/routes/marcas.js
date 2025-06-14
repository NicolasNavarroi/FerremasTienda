const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');
const { uploadMarca, uploadCargaInicial } = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');

// Rutas públicas
router.get('/', marcaController.listar);
router.get('/:id', marcaController.obtenerPorId);

// Rutas protegidas (solo admin)
router.post(
  '/',
  authMiddleware,
  checkRole([1]), // Solo rol 1 (Admin)
  uploadMarca.single('logo'),
  marcaController.crear
);

router.put(
  '/:id',
  authMiddleware,
  checkRole([1]),
  uploadMarca.single('logo'),
  marcaController.actualizar
);

router.delete(
  '/:id',
  authMiddleware,
  checkRole([1]),
  marcaController.eliminar
);

// Carga inicial de logos
router.post(
  '/carga-inicial',
  authMiddleware,
  checkRole([1]),
  uploadCargaInicial.array('logos', 10),
  marcaController.cargaInicial
);

module.exports = router;