const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateToken } = require('../utils/authUtils');

const authController = {
  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      
      // 1. Verificar si el usuario ya existe
      const [userExists] = await pool.query(
        'SELECT * FROM Usuario WHERE email = ? OR username = ?', 
        [email, username]
      );
      
      if (userExists.length > 0) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }

      // 2. Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // 3. Crear usuario
      const [result] = await pool.query(
        'INSERT INTO Usuario (username, email, Clave, id_tipo_usuario) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 3] // 3 = ID para cliente
      );

      // 4. Generar token
      const token = generateToken(result.insertId, username, 3);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        userId: result.insertId
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      // 1. Buscar usuario
      const [users] = await pool.query(
        'SELECT * FROM Usuario WHERE email = ?', 
        [email]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = users[0];

      // 2. Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.Clave);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // 3. Generar token
      const token = generateToken(user.idUsuario, user.username, user.id_tipo_usuario);

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        userId: user.idUsuario,
        username: user.username,
        role: user.id_tipo_usuario
      });
    } catch (error) {
      next(error);
    }
  },

  verifyToken: (req, res) => {
    // Este middleware ya verifica el token
    res.json({ 
      isValid: true,
      user: req.user 
    });
  }
};

module.exports = authController;