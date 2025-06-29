const CarritoModel = require('../models/carritoModel');
const ProductoModel = require('../models/productoModel');

class CarritoController {
    async agregarItem(req, res) {
        try {
            const { idProducto, cantidad = 1, idSucursal = 1 } = req.body;
            const idUsuario = req.user.id;

            if (!idProducto) {
                return res.status(400).json({ error: 'idProducto es requerido' });
            }

            const producto = await ProductoModel.obtenerDisponibilidad(idProducto, idSucursal);
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            if (producto.stock < cantidad) {
                return res.status(400).json({
                    error: 'Stock insuficiente',
                    stockDisponible: producto.stock
                });
            }

            let [carrito] = await CarritoModel.obtenerPorUsuario(idUsuario);
            if (!carrito) {
                const idCarrito = await CarritoModel.crear(idUsuario);
                carrito = { id_Carrito: idCarrito };
            }

            await CarritoModel.agregarItem(
                carrito.id_Carrito,
                idProducto,
                cantidad,
                producto.precio
            );

            res.status(201).json({
                success: true,
                carritoId: carrito.id_Carrito
            });

        } catch (error) {
            console.error('Error en agregarItem:', error);
            res.status(500).json({
                error: 'Error interno',
                detalle: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }
}

module.exports = new CarritoController();
