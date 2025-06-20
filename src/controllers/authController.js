const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Configuración de roles y redirecciones
const ROLES = {
  ADMIN: 1,
  EMPLOYEE: 2,
  CLIENT: 3
};

const ROLE_REDIRECTS = {
  [ROLES.ADMIN]: '/admin/usermanagement',
  [ROLES.EMPLOYEE]: '/employee/productmanagement',
  [ROLES.CLIENT]: '/'
};

const authController = {

  register : async (req, res) => {
  try {
    // Implementación de registro
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.query(
      'INSERT INTO Usuario (username, email, Clave, id_tipo_usuario) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, ROLES.CLIENT]
    );

    res.status(201).json({
      success: true,
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
},

  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;
      email = email.toLowerCase().trim();

      const [users] = await pool.query(
        `SELECT u.idUsuario, u.Username, u.Email, u.Clave, u.id_tipo_usuario 
         FROM Usuario u WHERE u.email = ? LIMIT 1`, 
        [email]
      );
      
      if (users.length === 0 || !await bcrypt.compare(password, users[0].Clave)) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = users[0];
      const token = jwt.sign(
        {
          id: user.idUsuario,
          username: user.Username,
          email: user.Email,
          tipo: user.id_tipo_usuario
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        user: {
          id: user.idUsuario,
          username: user.Username,
          email: user.Email,
          tipo: user.id_tipo_usuario
        },
        redirectTo: ROLE_REDIRECTS[user.id_tipo_usuario]
      });

    } catch (error) {
      console.error('Error en login:', error);
      next(error);
    }
  },

  verifyToken: async (req, res, next) => {
    try {
      const [user] = await pool.query(
        `SELECT u.idUsuario, u.Username, u.Email, u.id_tipo_usuario, t.Tipo_usuario as nombre_rol
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

      const response = {
        success: true,
        isValid: true,
        user: {
          ...user[0],
          profile: profile[0] || null
        }
      };

      // Añadir redirección si es admin y no está en ruta admin
      if (user[0].id_tipo_usuario === ROLES.ADMIN && !req.originalUrl.startsWith('/admin')) {
        response.redirectTo = '/admin/user-management';
        response.message = 'Redirigiendo a panel de administración';
      }

      res.json(response);
    } catch (error) {
      console.error('Error al verificar token:', error);
      next(error);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const [user] = await pool.query(
        `SELECT u.idUsuario, u.Username, u.Email, u.id_tipo_usuario, t.Tipo_usuario as nombre_rol, p.Nombre_apellido, p.Telefono, p.Direccion
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
  },

  createAdmin: async (req, res, next) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        success: false,
        error: 'Acceso prohibido en producción' 
      });
    }

    const connection = await pool.getConnection();
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Todos los campos son requeridos'
        });
      }

      await connection.beginTransaction();
      const hashedPassword = await bcrypt.hash(password, 12);
      const [userResult] = await connection.query(
        'INSERT INTO Usuario (username, email, Clave, id_tipo_usuario) VALUES (?, ?, ?, ?)',
        [username, email.toLowerCase(), hashedPassword, ROLES.ADMIN]
      );

      await connection.query(
        'INSERT INTO Perfil_usuario (id_usuario) VALUES (?)',
        [userResult.insertId]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Usuario admin creado exitosamente',
        userId: userResult.insertId
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error al crear admin:', error);
      next(error);
    } finally {
      connection.release();
    }
  }
};

module.exports = authController;