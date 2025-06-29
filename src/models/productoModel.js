const db = require('../config/db');

class Producto {
  static async crear({ codigo_producto, nombre, descripcion, id_categoria, id_marca, precio, stock, imagen }) {
    const [result] = await db.query(
      `INSERT INTO Producto 
       (Codigo_producto, nombre, Descripcion, id_categoria, id_marca, Precio, Stock, Imagen, Fecha_ingreso) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [codigo_producto, nombre, descripcion, id_categoria, id_marca, precio, stock, imagen]
    );

    await db.query(
      'INSERT INTO historial_precio (id_producto, fecha, valor) VALUES (?, NOW(), ?)',
      [result.insertId, precio]
    );

    return result.insertId;
  }
  static async obtenerPorId(id) {
  const [rows] = await db.query(
    `SELECT 
       p.idProducto,
       p.Codigo_producto AS codigo_producto,
       p.nombre,
       p.Descripcion AS descripcion,
       p.id_categoria,
       p.id_marca,
       p.Precio AS precio,
       p.Stock AS stock,
       p.Imagen AS imagen,
       p.Fecha_ingreso AS fecha_ingreso,
       c.nombre AS categoria,
       m.nombre AS marca,
       (SELECT valor FROM historial_precio hp 
        WHERE hp.id_producto = p.idProducto 
        ORDER BY fecha DESC LIMIT 1) as precio_actual
     FROM Producto p
     JOIN categoria c ON p.id_categoria = c.id_categoria
     JOIN marca m ON p.id_marca = m.id_marca
     WHERE p.idProducto = ?`, 
    [id]
  );
  return rows[0];
}

  static async obtenerTodos(filtros = {}) {
  let query = `
    SELECT 
      p.idProducto,
      p.Codigo_producto AS codigo_producto,
      p.nombre,
      p.Descripcion AS descripcion,
      p.Precio AS precio,
      p.Stock AS stock,
      p.Imagen AS imagen,
      p.Fecha_ingreso AS fecha_ingreso,
      c.nombre AS categoria,
      m.nombre AS marca
    FROM Producto p
    JOIN categoria c ON p.id_categoria = c.id_categoria
    JOIN marca m ON p.id_marca = m.id_marca
    WHERE 1=1
  `;

  const params = [];

  // Filtro por categoría (usa id_categoria en lugar de nombre)
  if (filtros.category) {
    query += ' AND c.nombre = ?';
    params.push(filtros.category);
  }

  // Filtro por precio mínimo
  if (filtros.minPrice) {
    query += ' AND p.Precio >= ?';
    params.push(parseFloat(filtros.minPrice));
  }

  // Filtro por precio máximo
  if (filtros.maxPrice) {
    query += ' AND p.Precio <= ?';
    params.push(parseFloat(filtros.maxPrice));
  }

  // Filtro por búsqueda (nombre)
  if (filtros.search) {
    query += ' AND (p.nombre LIKE ? OR p.Descripcion LIKE ?)';
    params.push(`%${filtros.search}%`, `%${filtros.search}%`);
  }

  query += ' ORDER BY p.nombre';

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error en obtenerTodos:', error);
    throw error;
  }
}

  static async actualizar(id, datos) {
    if (datos.Precio) {
      const [producto] = await db.query(
        'SELECT Precio FROM Producto WHERE idProducto = ?',
        [id]
      );

      if (producto.length && producto[0].Precio !== datos.Precio) {
        await db.query(
          'INSERT INTO historial_precio (id_producto, fecha, valor) VALUES (?, NOW(), ?)',
          [id, datos.Precio]
        );
      }
    }

    const [result] = await db.query(
      'UPDATE Producto SET ? WHERE idProducto = ?',
      [datos, id]
    );
    return result.affectedRows;
  }

  static async eliminar(id) {
    const [result] = await db.query(
      'DELETE FROM Producto WHERE idProducto = ?',
      [id]
    );
    return result.affectedRows;
  }

  static async actualizarStock(id, cantidad) {
    const [result] = await db.query(
      'UPDATE Producto SET Stock = Stock + ? WHERE idProducto = ?',
      [cantidad, id]
    );

    if (result.affectedRows) {
      await db.query(
        'UPDATE inventario_sucursal SET stock = stock + ? WHERE id_producto = ?',
        [cantidad, id]
      );
    }

    return result.affectedRows;
  }

  static async obtenerDisponibilidad(idProducto, idSucursal) {
    const [rows] = await db.query(
      `SELECT 
         p.idProducto,
         p.Precio AS precio,
         i.stock as stock
       FROM Producto p
       LEFT JOIN inventario_sucursal i ON p.idProducto = i.id_producto AND i.id_sucursal = ?
       WHERE p.idProducto = ?`,
      [idSucursal, idProducto]
    );
    return rows[0];
  }

  static async obtenerHistorialPrecios(idProducto) {
    const [rows] = await db.query(
      'SELECT * FROM historial_precio WHERE id_producto = ? ORDER BY fecha DESC',
      [idProducto]
    );
    return rows;
  }
}

module.exports = Producto;
