const Marca = require('../models/marcaModel');
const fs = require('fs');
const path = require('path');

const marcaController = {
  crear: async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      const logo = req.file.filename;
      const safeName = nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const logo_path = path.join('marcas', safeName, logo);

      // Verificar si la marca ya existe
      const marcaExistente = await Marca.buscarPorNombre(nombre);
      if (marcaExistente) {
        fs.unlinkSync(req.file.path); // Eliminar archivo subido
        return res.status(400).json({ error: 'La marca ya existe' });
      }

      const id = await Marca.crear({ nombre, descripcion, logo, logo_path });
      res.status(201).json({ id });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Error al crear marca', details: error.message });
    }
  },

  listar: async (req, res) => {
    try {
      const marcas = await Marca.obtenerTodas();
      res.json(marcas);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar marcas' });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const marca = await Marca.obtenerPorId(req.params.id);
      if (!marca) return res.status(404).json({ error: 'Marca no encontrada' });
      res.json(marca);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener marca' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const marcaActual = await Marca.obtenerPorId(id);

      if (!marcaActual) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Marca no encontrada' });
      }

      if (req.file) {
        // Eliminar logo anterior si existe
        if (marcaActual.logo_path) {
          const oldPath = path.join('public', marcaActual.logo_path);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        datos.logo = req.file.filename;
        datos.logo_path = path.join('marcas', 
          datos.nombre.toLowerCase().replace(/[^a-z0-9]/gi, '_'), 
          datos.logo
        );
      }

      const actualizado = await Marca.actualizar(id, datos);
      res.json({ actualizado });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Error al actualizar marca' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const marca = await Marca.obtenerPorId(id);

      if (!marca) {
        return res.status(404).json({ error: 'Marca no encontrada' });
      }

      // Eliminar archivo de logo
      if (marca.logo_path) {
        const filePath = path.join('public', marca.logo_path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await Marca.eliminar(id);
      res.json({ mensaje: 'Marca eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar marca' });
    }
  },

  cargaInicial: async (req, res) => {
    try {
      const results = [];

      for (const file of req.files) {
        try {
          const marcaName = file.originalname.split('_')[0].toLowerCase();
          const marca = await Marca.buscarPorNombre(marcaName);

          if (marca) {
            const safeName = marcaName.replace(/[^a-z0-9]/gi, '_');
            const newFilename = `${safeName}_logo${path.extname(file.originalname)}`;
            const targetDir = path.join('public', 'marcas', safeName);
            const targetPath = path.join(targetDir, newFilename);

            fs.mkdirSync(targetDir, { recursive: true });
            fs.renameSync(file.path, targetPath);

            await Marca.actualizar(marca.id_marca, {
              logo: newFilename,
              logo_path: `marcas/${safeName}/${newFilename}`
            });

            results.push({ marca: marca.nombre, status: 'success', file: newFilename });
          } else {
            results.push({ file: file.originalname, status: 'error', error: 'Marca no encontrada' });
            fs.unlinkSync(file.path);
          }
        } catch (error) {
          results.push({ 
            file: file.originalname, 
            status: 'error', 
            error: error.message 
          });
        }
      }

      // Limpiar directorio temporal
      fs.rmSync(path.dirname(req.files[0].path), { recursive: true, force: true });

      res.json({ 
        message: 'Carga inicial completada', 
        results 
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error en carga inicial',
        details: error.message 
      });
    }
  }
};

module.exports = marcaController;