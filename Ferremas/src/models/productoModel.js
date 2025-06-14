const db = require('../config/db');

class Producto {
  static async crear({ codigo_producto, nombre, descripcion, id_categoria, id_marca, precio, stock, imagen }) {
    const [result] = await db.query(
      `INSERT INTO Producto 
       (Codigo_producto, nombre, Descripcion, id_categoria, id_marca, Precio, Stock, Imagen) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_producto, nombre, descripcion, id_categoria, id_marca, precio, stock, imagen]
    );
    return result.insertId;
  }

  static async obtenerTodos() {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre as categoria, m.nombre as marca 
       FROM Producto p
       JOIN categoria c ON p.id_categoria = c.id_categoria
       JOIN marca m ON p.id_marca = m.id_marca`
    );
    return rows;
  }

  static async obtenerPorId(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre as categoria, m.nombre as marca 
       FROM Producto p
       JOIN categoria c ON p.id_categoria = c.id_categoria
       JOIN marca m ON p.id_marca = m.id_marca
       WHERE p.idProducto = ?`, 
      [id]
    );
    return rows[0];
  }

  static async actualizar(id, datos) {
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
    return result.affectedRows;
  }
}

module.exports = Producto;