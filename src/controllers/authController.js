const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateToken } = require('../utils/authUtils');
const { validateRegister, validateLogin } = require('../middleware/authValidators');

const authController = {
  /**
   * Registro de nuevos usuarios (clientes)
   */
  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Validación de campos
      if (!username || !email || !password) {
        return res.status(400).json({ 
          error: 'Todos los campos son requeridos',
          details: {
            username: 'Nombre de usuario requerido',
            email: 'Email requerido',
            password: 'Contraseña requerida'
          }
        });
      }

      // Verificar si el usuario ya existe
      const [userExists] = await pool.query(
        'SELECT idUsuario FROM Usuario WHERE email = ? OR username = ? LIMIT 1', 
        [email, username]
      );
      
      if (userExists.length > 0) {
        return res.status(409).json({ 
          error: 'El usuario ya existe',
          details: {
            email: userExists[0].email === email ? 'Email ya registrado' : null,
            username: userExists[0].username === username ? 'Nombre de usuario en uso' : null
          }
        });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario en transacción
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Insertar usuario
        const [userResult] = await connection.query(
          'INSERT INTO Usuario (username, email, Clave, id_tipo_usuario) VALUES (?, ?, ?, ?)',
          [username, email, hashedPassword, 3] // 3 = ID para cliente
        );

        // Crear perfil básico
        await connection.query(
          'INSERT INTO Perfil_usuario (id_usuario) VALUES (?)',
          [userResult.insertId]
        );

        await connection.commit();

        // Generar token
        const token = generateToken({
          id: userResult.insertId,
          username,
          role: 3,
          email
        });

        res.status(201).json({
          success: true,
          message: 'Usuario registrado exitosamente',
          token,
          user: {
            id: userResult.insertId,
            username,
            email,
            role: 3
          }
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error en registro:', error);
      next(error);
    }
  },

  /**
   * Inicio de sesión para todos los tipos de usuario
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validación básica
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email y contraseña son requeridos',
          details: {
            email: !email ? 'Email es requerido' : null,
            password: !password ? 'Contraseña es requerida' : null
          }
        });
      }

      // Buscar usuario con información de rol
      const [users] = await pool.query(
        `SELECT 
          u.idUsuario, 
          u.Username, 
          u.Email, 
          u.Clave,
          u.id_tipo_usuario,
          t.Tipo_usuario as nombre_rol
         FROM Usuario u
         JOIN Tipo_usuario t ON u.id_tipo_usuario = t.id_Tipo_usuario
         WHERE u.email = ? LIMIT 1`, 
        [email]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false,
          error: 'Credenciales inválidas',
          details: 'Usuario no encontrado'
        });
      }

      const user = users[0];

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.Clave);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          error: 'Credenciales inválidas',
          details: 'Contraseña incorrecta'
        });
      }

      // Generar token con más información
      const token = generateToken({
        id: user.idUsuario,
        username: user.Username,
        email: user.Email,
        role: user.id_tipo_usuario,
        roleName: user.nombre_rol
      });

      // Obtener información adicional del perfil
      const [profile] = await pool.query(
        'SELECT Nombre_apellido, Telefono FROM Perfil_usuario WHERE id_usuario = ?',
        [user.idUsuario]
      );

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.idUsuario,
          username: user.Username,
          email: user.Email,
          role: user.id_tipo_usuario,
          roleName: user.nombre_rol,
          profile: profile[0] || null
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      next(error);
    }
  },

  /**
   * Verificación de token
   */
  verifyToken: async (req, res, next) => {
    try {
      // El middleware de autenticación ya verificó el token
      // Podemos agregar información adicional del usuario aquí
      const [user] = await pool.query(
        `SELECT 
          u.idUsuario, 
          u.Username, 
          u.Email,
          u.id_tipo_usuario,
          t.Tipo_usuario as nombre_rol
         FROM Usuario u
         JOIN Tipo_usuario t ON u.id_tipo_usuario = t.id_Tipo_usuario
         WHERE u.idUsuario = ? LIMIT 1`, 
        [req.user.id]
      );

      if (user.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      const [profile] = await pool.query(
        'SELECT Nombre_apellido, Telefono, Direccion FROM Perfil_usuario WHERE id_usuario = ?',
        [req.user.id]
      );

      res.json({
        success: true,
        isValid: true,
        user: {
          ...user[0],
          profile: profile[0] || null
        }
      });
    } catch (error) {
      console.error('Error al verificar token:', error);
      next(error);
    }
  },

  /**
   * Obtener información del usuario actual
   */
  getCurrentUser: async (req, res, next) => {
    try {
      const [user] = await pool.query(
        `SELECT 
          u.idUsuario, 
          u.Username, 
          u.Email,
          u.id_tipo_usuario,
          t.Tipo_usuario as nombre_rol,
          p.Nombre_apellido,
          p.Telefono,
          p.Direccion
         FROM Usuario u
         JOIN Tipo_usuario t ON u.id_tipo_usuario = t.id_Tipo_usuario
         LEFT JOIN Perfil_usuario p ON u.idUsuario = p.id_usuario
         WHERE u.idUsuario = ? LIMIT 1`, 
        [req.user.id]
      );

      if (user.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        user: user[0]
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      next(error);
    }
  }
};

module.exports = authController;