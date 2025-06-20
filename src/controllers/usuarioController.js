const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const usuarioController = {
  registrar: async (req, res) => {
    try {
      const { username, email, clave } = req.body;
      
      if (!email || !clave) {
        return res.status(400).json({ 
          success: false,
          error: 'Email y contraseña son requeridos' 
        });
      }

      const usuarioExistente = await Usuario.obtenerPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ 
          success: false,
          error: 'El email ya está registrado' 
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(clave, salt);

      const idUsuario = await Usuario.crear({
        username,
        email,
        clave: hashedPassword,
        id_tipo_usuario: 3 // Cliente por defecto
      });

      res.status(201).json({ 
        success: true,
        mensaje: 'Usuario registrado exitosamente',
        idUsuario 
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al registrar usuario' 
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, clave } = req.body;
      
      if (!email || !clave) {
        return res.status(400).json({ 
          success: false,
          error: 'Email y contraseña son requeridos' 
        });
      }

      const usuario = await Usuario.obtenerPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ 
          success: false,
          error: 'Credenciales inválidas' 
        });
      }

      const esValida = await bcrypt.compare(clave, usuario.Clave);
      if (!esValida) {
        return res.status(401).json({ 
          success: false,
          error: 'Credenciales inválidas' 
        });
      }

      const token = jwt.sign(
        { 
          id: usuario.idUsuario, 
          tipo: usuario.id_tipo_usuario,
          username: usuario.Username,
          email: usuario.Email
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({ 
        success: true,
        token,
        user: {
          id: usuario.idUsuario,
          tipo: usuario.id_tipo_usuario,
          username: usuario.Username,
          email: usuario.Email
        },
        redirectTo: usuario.id_tipo_usuario === 1 ? '/admin/usermanagement' : 
                  usuario.id_tipo_usuario === 2 ? '/employee/productmanagement' : '/'
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al iniciar sesión' 
      });
    }
  },

  obtenerPerfil: async (req, res) => {
    try {
      const usuario = await Usuario.obtenerPerfil(req.user.id);
      if (!usuario) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }
      res.json({ 
        success: true,
        usuario 
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener perfil' 
      });
    }
  },

  actualizarPerfil: async (req, res) => {
    try {
      const { username, email, clave } = req.body;
      const datosActualizar = {};

      if (username) datosActualizar.username = username;
      if (email) datosActualizar.email = email;
      if (clave) {
        const salt = await bcrypt.genSalt(10);
        datosActualizar.clave = await bcrypt.hash(clave, salt);
      }

      await Usuario.actualizar(req.user.id, datosActualizar);
      res.json({ 
        success: true,
        mensaje: 'Perfil actualizado exitosamente' 
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar perfil' 
      });
    }
  },

  eliminarCuenta: async (req, res) => {
    try {
      await Usuario.eliminar(req.user.id);
      res.json({ 
        success: true,
        mensaje: 'Cuenta eliminada exitosamente' 
      });
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al eliminar cuenta' 
      });
    }
  },

  // ADMIN: Gestión de usuarios
  listarUsuarios: async (req, res) => {
    try {
      const { rol } = req.query;
      const rolesFiltro = rol ? [rol] : [1, 2, 3];
      const usuarios = await Usuario.listarUsuarios(rolesFiltro);
      res.json({ 
        success: true,
        usuarios 
      });
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al listar usuarios' 
      });
    }
  },

  obtenerUsuario: async (req, res) => {
    try {
      const usuario = await Usuario.obtenerPorId(req.params.id);
      if (!usuario) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }
      res.json({ 
        success: true,
        usuario 
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener usuario' 
      });
    }
  },

  crearUsuario: async (req, res) => {
    try {
      const { username, email, clave, rol } = req.body;
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(clave, salt);

      const idUsuario = await Usuario.crear({
        username,
        email,
        clave: hashedPassword,
        id_tipo_usuario: rol || 2
      });

      res.status(201).json({ 
        success: true,
        mensaje: 'Usuario creado exitosamente',
        idUsuario 
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al crear usuario' 
      });
    }
  },

  actualizarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, rol } = req.body;

      const datosActualizar = {};
      if (username) datosActualizar.username = username;
      if (email) datosActualizar.email = email;

      if (Object.keys(datosActualizar).length > 0) {
        await Usuario.actualizar(id, datosActualizar);
      }

      if (rol) {
        await Usuario.actualizarRol(id, rol);
      }

      res.json({ 
        success: true,
        mensaje: 'Usuario actualizado exitosamente' 
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar usuario' 
      });
    }
  },

  eliminarUsuario: async (req, res) => {
    try {
      await Usuario.eliminar(req.params.id);
      res.json({ 
        success: true,
        mensaje: 'Usuario eliminado exitosamente' 
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al eliminar usuario' 
      });
    }
  },

  listarTrabajadores: async (req, res) => {
    try {
      const trabajadores = await Usuario.listarTrabajadores();
      res.json({ 
        success: true,
        trabajadores 
      });
    } catch (error) {
      console.error('Error al listar trabajadores:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al listar trabajadores' 
      });
    }
  },

  crearTrabajador: async (req, res) => {
    try {
      const { username, email, clave } = req.body;
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(clave, salt);

      const idUsuario = await Usuario.crear({
        username,
        email,
        clave: hashedPassword,
        id_tipo_usuario: 2 // Rol de trabajador
      });

      res.status(201).json({ 
        success: true,
        mensaje: 'Trabajador creado exitosamente',
        idUsuario 
      });
    } catch (error) {
      console.error('Error al crear trabajador:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al crear trabajador' 
      });
    }
  }
};

module.exports = usuarioController;