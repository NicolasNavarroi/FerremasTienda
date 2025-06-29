const Producto = require('../models/productoModel');
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

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
                stock
            } = req.body;

            // Validación de campos requeridos
            if (!nombre || !precio || !stock || !id_categoria || !id_marca) {
                // Si hay imagen subida pero hay error, la eliminamos
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ 
                    error: 'Nombre, precio, stock, categoría y marca son requeridos' 
                });
            }

            // Manejo de la imagen
            let imagen = 'default-product.jpg';
            if (req.file) {
              imagen = `/uploads/products/${req.file.filename}`; // Ruta consistente
            }
            const idProducto = await Producto.crear({
                codigo_producto: codigo_producto || `PROD-${Date.now()}`,
                nombre,
                descripcion,
                id_categoria,
                id_marca,
                precio: parseFloat(precio),
                stock: parseInt(stock),
                imagen
            });

            res.status(201).json({ 
                mensaje: 'Producto creado exitosamente',
                idProducto,
                imagen
            });
        } catch (error) {
            // Limpieza en caso de error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Error al crear producto:', error);
            res.status(500).json({ 
                error: 'Error al crear producto',
                detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    listarProductos: async (req, res) => {
  try {
    const productos = await Producto.obtenerTodos({
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search
    });

    console.log('Productos encontrados en DB:', productos.length);
    
    // Verifica que los productos tengan imagen
    productos.forEach(p => {
      console.log(`Producto: ${p.nombre}, Imagen: ${p.imagen}`);
    });

    res.json({
      success: true,
      count: productos.length,
      data: productos
    });
  } catch (error) {
    console.error('Error en listarProductos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al listar productos'
    });
  }
},
    obtenerProducto: async (req, res) => {
  try {
    console.log(`Buscando producto con ID: ${req.params.id}`); // Debug
    const producto = await Producto.obtenerPorId(req.params.id);
    
    if (!producto) {
      console.log('Producto no encontrado en DB'); // Debug
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    console.log('Producto encontrado:', producto); // Debug
    res.json(producto);
  } catch (error) {
    console.error('Error en obtenerProducto:', error);
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

            // Si se subió nueva imagen
            if (req.file) {
                datosActualizados.imagen =`/uploads/products/${req.file.filename}`;
                
                // Opcional: Eliminar la imagen anterior si no es la default
                const productoAnterior = await Producto.obtenerPorId(id);
                if (productoAnterior.imagen && !productoAnterior.imagen.includes('default-product')) {
                    const oldImagePath = path.join(__dirname, '../public', productoAnterior.imagen);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }

            const actualizado = await Producto.actualizar(id, datosActualizados);
            
            if (!actualizado) {
                // Si no se actualizó pero se subió imagen, limpiar
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            res.json({ 
                mensaje: 'Producto actualizado',
                cambios: datosActualizados
            });
        } catch (error) {
            // Limpieza en caso de error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
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
            
            // Primero eliminar registros relacionados en historial_precio
            await pool.query('DELETE FROM historial_precio WHERE id_producto = ?', [id]);
            
            // Luego eliminar el producto
            await pool.query('DELETE FROM Producto WHERE idProducto = ?', [id]);
            
            res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                res.status(400).json({ 
                    error: 'No se puede eliminar el producto porque tiene registros asociados en otras tablas' 
                });
            } else {
                res.status(500).json({ 
                    error: 'Error al eliminar el producto',
                    detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
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