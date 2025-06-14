const Producto = require('../models/productoModel');

const productoController = {
  crearProducto: async (req, res) => {
    try {
      const { 
        codigo_producto, 
        nombre, 
        descripcion, 
        id_categoria, 
        id_marca, 
        precio, 
        stock,
        imagen 
      } = req.body;

      // Validación básica
      if (!nombre || !precio || !stock) {
        return res.status(400).json({ error: 'Nombre, precio y stock son requeridos' });
      }

      const idProducto = await Producto.crear({
        codigo_producto: codigo_producto || `PROD-${Date.now()}`,
        nombre,
        descripcion,
        id_categoria,
        id_marca,
        precio,
        stock,
        imagen: imagen || 'default-product.jpg'
      });

      res.status(201).json({ 
        mensaje: 'Producto creado exitosamente',
        idProducto 
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  listarProductos: async (req, res) => {
    try {
      const productos = await Producto.obtenerTodos();
      res.json(productos);
    } catch (error) {
      console.error('Error al listar productos:', error);
      res.status(500).json({ error: 'Error al listar productos' });
    }
  },

  obtenerProducto: async (req, res) => {
    try {
      const producto = await Producto.obtenerPorId(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  actualizarProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;

      const actualizado = await Producto.actualizar(id, datosActualizados);
      if (!actualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ mensaje: 'Producto actualizado' });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  eliminarProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await Producto.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  },

  actualizarStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      const actualizado = await Producto.actualizarStock(id, cantidad);
      if (!actualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ mensaje: 'Stock actualizado' });
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ error: 'Error al actualizar stock' });
    }
  }
};

module.exports = productoController;