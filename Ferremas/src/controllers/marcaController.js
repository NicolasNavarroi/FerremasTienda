const Marca = require('../models/marcaModel');

const marcaController = {
  crear: async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      const { filename: logo, path: logo_path } = req.file; // Asumiendo multer para subida de archivos

      const id = await Marca.crear({ 
        nombre, 
        descripcion, 
        logo, 
        logo_path: `marcas/${nombre.toLowerCase()}/${logo}` 
      });
      
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
      
      // Si se subió un nuevo archivo
      if (req.file) {
        const { filename: logo, path: logo_path } = req.file;
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
  }
};

module.exports = marcaController;