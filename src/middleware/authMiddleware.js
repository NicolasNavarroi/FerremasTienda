// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.query.token || 
                 req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role || decoded.tipo,
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error.message);
    res.status(401).json({ 
      success: false,
      error: 'Autenticación fallida',
      details: error.message
    });
  }
};

const checkRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({ 
        success: false,
        error: 'Error de autenticación' 
      });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso no autorizado',
        requiredRole: rolesPermitidos,
        yourRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  checkRole
};
