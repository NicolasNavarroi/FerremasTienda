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

      // Validación mejorada
      if (!nombre || !precio || !stock || !id_categoria || !id_marca) {
        return res.status(400).json({ 
          error: 'Nombre, precio, stock, categoría y marca son requeridos' 
        });
      }

      const idProducto = await Producto.crear({
        codigo_producto: codigo_producto || `PROD-${Date.now()}`,
        nombre,
        descripcion,
        id_categoria,
        id_marca,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: imagen || 'default-product.jpg'
      });

      res.status(201).json({ 
        mensaje: 'Producto creado exitosamente',
        idProducto,
        precio,
        stock
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ 
        error: 'Error al crear producto',
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  listarProductos: async (req, res) => {
    try {
      const { categoria, marca, stockMin } = req.query;
      const productos = await Producto.obtenerTodos({ 
        categoria, 
        marca, 
        stockMin 
      });
      res.json(productos);
    } catch (error) {
      console.error('Error al listar productos:', error);
      res.status(500).json({ 
        error: 'Error al listar productos',
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  obtenerProducto: async (req, res) => {
    try {
      const producto = await Producto.obtenerPorId(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      // Obtener historial de precios si se solicita
      if (req.query.historial === 'true') {
        producto.historial_precios = await Producto.obtenerHistorialPrecios(req.params.id);
      }
      
      res.json(producto);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ 
        error: 'Error al obtener producto',
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  actualizarProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;

      // Validar campos requeridos para actualización
      if (datosActualizados.precio && isNaN(datosActualizados.precio)) {
        return res.status(400).json({ error: 'Precio debe ser un número válido' });
      }

      const actualizado = await Producto.actualizar(id, datosActualizados);
      if (!actualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ 
        mensaje: 'Producto actualizado',
        cambios: datosActualizados
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ 
        error: 'Error al actualizar producto',
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
      
      // Manejar error de FK constraint
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ 
          error: 'No se puede eliminar, el producto está asociado a ventas o inventario'
        });
      }
      
      res.status(500).json({ 
        error: 'Error al eliminar producto',
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  actualizarStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad, idSucursal } = req.body;

      if (isNaN(cantidad)) {
        return res.status(400).json({ error: 'Cantidad debe ser un número válido' });
      }

      // Actualizar stock general y de sucursal si se especifica
      const actualizado = await Producto.actualizarStock(id, cantidad);
      if (!actualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const response = { mensaje: 'Stock actualizado', cantidad };
      
      if (idSucursal) {
        const inventario = await Producto.obtenerDisponibilidad(id, idSucursal);
        response.stock_sucursal = inventario.stock_sucursal;
      }

      res.json(response);
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ 
        error: 'Error al actualizar stock',
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  // Nuevo método para obtener disponibilidad en sucursal
  obtenerDisponibilidad: async (req, res) => {
    try {
      const { id } = req.params;
      const { sucursal } = req.query;
      
      if (!sucursal) {
        return res.status(400).json({ error: 'ID de sucursal requerido' });
      }

      const producto = await Producto.obtenerDisponibilidad(id, sucursal);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado en la sucursal especificada' });
      }

      res.json(producto);
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      res.status(500).json({ 
        error: 'Error al obtener disponibilidad',
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = productoController;