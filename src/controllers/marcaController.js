const Marca = require('../models/marcaModel');
const fs = require('fs');
const path = require('path');

const marcaController = {
  crear: async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      const { filename: logo, path: filePath } = req.file;

      const logo_path = `marcas/${nombre.toLowerCase()}/${logo}`;
      
      // Mover el archivo a su ubicación final
      const targetDir = path.join('public', 'marcas', nombre.toLowerCase());
      const targetPath = path.join(targetDir, logo);
      
      fs.mkdirSync(targetDir, { recursive: true });
      fs.renameSync(filePath, targetPath);

      const id = await Marca.crear({ nombre, descripcion, logo, logo_path });
      
      res.status(201).json({ id });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear marca' });
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
      if (!marca) {
        return res.status(404).json({ error: 'Marca no encontrada' });
      }
      res.json(marca);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener marca' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      
      if (req.file) {
        const { filename: logo, path: filePath } = req.file;
        const targetDir = path.join('public', 'marcas', datos.nombre.toLowerCase());
        const targetPath = path.join(targetDir, logo);
        
        fs.mkdirSync(targetDir, { recursive: true });
        fs.renameSync(filePath, targetPath);

        datos.logo = logo;
        datos.logo_path = `marcas/${datos.nombre.toLowerCase()}/${logo}`;
      }

      const actualizado = await Marca.actualizar(id, datos);
      res.json({ actualizado });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar marca' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      await Marca.eliminar(id);
      res.json({ mensaje: 'Marca eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar marca' });
    }
  },

  // Nuevo método para carga inicial de logos
  cargaInicial: async (req, res) => {
    try {
      const tempDir = 'temp_uploads/marcas';
      const results = [];

      // Procesar cada archivo subido
      for (const file of req.files) {
        try {
          // Extraer nombre de marca del archivo (ej: "truper_logo.png")
          const marcaName = file.originalname.split('_')[0].toLowerCase();
          
          // Buscar marca en la base de datos
          const marca = await Marca.buscarPorNombre(marcaName);
          
          if (marca) {
            const targetDir = path.join('public', 'marcas', marcaName);
            const newFilename = `${marcaName}_logo${path.extname(file.originalname)}`;
            const targetPath = path.join(targetDir, newFilename);

            // Crear directorio y mover archivo
            fs.mkdirSync(targetDir, { recursive: true });
            fs.renameSync(file.path, targetPath);

            // Actualizar base de datos
            await Marca.actualizar(marca.id_marca, {
              logo: newFilename,
              logo_path: `marcas/${marcaName}/${newFilename}`
            });

            results.push({
              marca: marca.nombre,
              file: newFilename,
              status: 'success'
            });
          } else {
            results.push({
              file: file.originalname,
              status: 'error',
              error: `Marca ${marcaName} no encontrada en BD`
            });
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
      fs.rmSync(tempDir, { recursive: true, force: true });

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