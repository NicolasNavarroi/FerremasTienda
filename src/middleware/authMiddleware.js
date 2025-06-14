const jwt = require('jsonwebtoken');
require('dotenv').config();

// Versión mejorada de tu middleware con:
// 1. Validación reforzada
// 2. Manejo de errores detallado
// 3. Compatibilidad con checkRole
const authMiddleware = (req, res, next) => {
  try {
    // 1. Obtener token de múltiples fuentes (Header, Query, Cookies)
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.query.token || 
                 req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado',
        details: 'Token no proporcionado en headers, query o cookies'
      });
    }

    // 2. Verificación segura del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { 
      algorithms: ['HS256'] // Fuerza algoritmo seguro
    });

    // 3. Validación de datos mínimos en el token
    if (!decoded.id || !decoded.tipo) {
      throw new Error('Token corrupto: faltan campos esenciales');
    }

    // 4. Adjuntar datos mejorados al request
    req.user = {
      id: decoded.id,
      tipo: decoded.tipo,
      username: decoded.username,
      // Nuevos campos útiles para logs/auditoría:
      sessionId: decoded.sessionId || null,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error.message);

    // Manejo específico de errores
    const response = {
      error: 'Autenticación fallida',
      details: error.message
    };

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        ...response,
        solution: 'Renueva tu token con /api/auth/refresh'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        ...response,
        solution: 'Inicia sesión nuevamente'
      });
    }

    res.status(401).json(response);
  }
};

// Middleware para control de roles (complementario)
const checkRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({ error: 'Middleware de roles ejecutado antes de authMiddleware' });
    }

    if (!rolesPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({
        error: 'Acceso prohibido',
        requiredRoles: rolesPermitidos,
        yourRole: req.user.tipo
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  checkRole
};