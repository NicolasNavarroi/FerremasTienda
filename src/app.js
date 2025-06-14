require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { createServer } = require('http');
const path = require('path');
const mysql = require('mysql2/promise');
const errorHandler = require('./middleware/errorHandler');

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

// Configuración mejorada del pool de MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'tienda',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'local',
  charset: 'utf8mb4',
  decimalNumbers: true, // Importante para manejar precios correctamente
  multipleStatements: false, // Seguridad adicional
  connectTimeout: 10000, // 10 segundos de timeout
  dateStrings: true // Para manejar fechas como strings
});

// Verificación de conexión mejorada con chequeo de tablas esenciales
const verifyDatabase = async () => {
  const requiredTables = [
    'Usuario', 'Producto', 'Carrito_compra', 
    'Detalle_carrito', 'VENTA', 'Promocion'
  ];
  
  const connection = await pool.getConnection();
  try {
    console.log('\x1b[32m', '🔌 Conectando a la base de datos...', '\x1b[0m');
    
    // Verificar tablas esenciales
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DB_NAME || 'tienda']
    );
    
    const existingTables = tables.map(t => t.TABLE_NAME);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.error('\x1b[31m', `❌ Tablas faltantes: ${missingTables.join(', ')}`, '\x1b[0m');
      throw new Error('Estructura de base de datos incompleta');
    }
    
    console.log('\x1b[32m', '✅ Base de datos verificada correctamente', '\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m', '❌ Error en la base de datos:', {
      code: error.code,
      message: error.message
    }, '\x1b[0m');
    
    // Intento de recrear estructura si está en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('\x1b[33m', '⚠️ Intentando recrear estructura...', '\x1b[0m');
      try {
        await require('./database/setup')(connection);
      } catch (setupError) {
        console.error('\x1b[31m', '❌ Error al recrear estructura:', setupError.message, '\x1b[0m');
      }
    }
    
    process.exit(1);
  } finally {
    connection.release();
  }
};

verifyDatabase();

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
  skip: (req) => req.path === '/api/status' // No loggear pings de salud
}));

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Para validación de webhooks
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100 // Máximo 100 parámetros
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
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Iniciar servidor con manejo de errores
const server = httpServer.listen(PORT, HOST, () => {
  const { address, port } = server.address();
  console.log('\x1b[36m', `🚀 Servidor escuchando en http://${address}:${port}`, '\x1b[0m');
  console.log('\x1b[33m', `🔧 Entorno: ${process.env.NODE_ENV || 'development'}`, '\x1b[0m');
  console.log('\x1b[35m', `🗄️  Base de datos: ${process.env.DB_NAME || 'tienda'}`, '\x1b[0m');
});

// Manejo de errores del servidor
server.on('error', (error) => {
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
    await new Promise((resolve) => server.close(resolve));
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
  server
};