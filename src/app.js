require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { createServer } = require('http');
const path = require('path');
const mysql = require('mysql2/promise');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarios');
const marcaRoutes = require('./routes/marcas');
const productoRoutes = require('./routes/productos');
const categoriaRoutes = require('./routes/categorias');
const carritoRoutes = require('./routes/carritos');
const sucursalRoutes = require('./routes/sucursal');
const promocionRoutes = require('./routes/promocion');
const ventaRoutes = require('./routes/ventas');

// Inicialización
const app = express();
const httpServer = createServer(app);

// Configuración de middlewares mejorada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', '*.amazonaws.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      connectSrc: ["'self'", '*.googleapis.com']
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',') 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Authorization', 'X-Total-Count']
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  skip: (req) => req.path === '/api/status'
}));

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100
}));

// Configuración de archivos estáticos optimizada
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (['.jpg', '.png', '.jpeg', '.webp', '.gif'].includes(ext)) {
      res.set('Cache-Control', 'public, max-age=604800, immutable');
    }
    if (['.js', '.css'].includes(ext)) {
      res.set('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Sistema de rutas API versionado
const apiRouter = express.Router();

// Rutas públicas
apiRouter.use('/auth', authRoutes);
apiRouter.get('/status', async (req, res) => {
  try {
    const [dbStatus] = await pool.query('SELECT 1 + 1 AS result');
    const uptime = process.uptime();
    
    res.json({
      status: 'operativo',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus[0].result === 2 ? 'healthy' : 'unstable',
      uptime: {
        hours: Math.floor(uptime / 3600),
        minutes: Math.floor((uptime % 3600) / 60),
        seconds: Math.floor(uptime % 60)
      },
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'degraded',
      error: 'Error al verificar estado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rutas autenticadas
apiRouter.use('/usuarios', usuarioRoutes);
apiRouter.use('/marcas', marcaRoutes);
apiRouter.use('/productos', productoRoutes);
apiRouter.use('/categorias', categoriaRoutes);
apiRouter.use('/carrito', carritoRoutes);
apiRouter.use('/sucursales', sucursalRoutes);
apiRouter.use('/promociones', promocionRoutes);
apiRouter.use('/ventas', ventaRoutes);

// Montar rutas API con versión
app.use('/api/v1', apiRouter);

// Redirección raíz y manejo de 404
app.get('/', (req, res) => res.redirect('/api/v1/status'));

app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    currentVersion: '/api/v1',
    documentation: `${req.protocol}://${req.get('host')}/api/v1/status`,
    timestamp: new Date().toISOString()
  });
});

// Middleware de errores mejorado
app.use(errorHandler);

// Configuración del servidor
const PORT = process.env.PORT || 3000;

// Iniciar servidor con manejo de errores
httpServer.listen(PORT, () => {
  const { address, port } = httpServer.address();
  console.log('\x1b[36m', `🚀 Servidor corriendo en http://localhost:${port}`, '\x1b[0m');
  console.log('\x1b[33m', `🔧 Entorno: ${process.env.NODE_ENV || 'development'}`, '\x1b[0m');
  console.log('\x1b[35m', `🗄️  Base de datos: ${process.env.DB_NAME || 'tienda'}`, '\x1b[0m');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('\x1b[31m', '⚠️ Error no capturado:', err, '\x1b[0m');
});

// Manejo de errores del servidor
httpServer.on('error', (error) => {
  console.error('\x1b[31m', '⚠️ Error del servidor:', error.message, '\x1b[0m');
  
  if (error.code === 'EADDRINUSE') {
    console.error('\x1b[31m', `El puerto ${PORT} está en uso. Intenta con otro puerto.`, '\x1b[0m');
  }
  
  process.exit(1);
});

// Manejo de señales para cierre elegante
const shutdown = async (signal) => {
  console.log('\x1b[33m', `⚠️ Recibido ${signal}. Cerrando servidor...`, '\x1b[0m');
  
  try {
    await new Promise((resolve) => httpServer.close(resolve));
    await pool.end();
    console.log('\x1b[32m', '✅ Servidor cerrado correctamente', '\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m', '❌ Error durante el cierre:', error.message, '\x1b[0m');
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Exportar para testing
module.exports = {
  app,
  pool,
  server: httpServer
};