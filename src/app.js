require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { createServer } = require('http');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');
const adminRedirect = require('./middleware/adminRedirect');

const app = express();
const httpServer = createServer(app);

// 1. Configuración de Seguridad
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

// 2. CORS
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',') 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Middlewares básicos
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Middleware de redirección para admin
app.use(adminRedirect);

// Configuración correcta de archivos estáticos
app.use('/uploads/products', express.static(
  path.join(__dirname, 'public/uploads/products'),
  {
    maxAge: '7d',
    setHeaders: (res, path) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
));


// 6. Sistema de Rutas
const apiRouter = express.Router();

// Rutas Públicas
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/dolar', require('./routes/dolar'));

apiRouter.get('/status', async (req, res) => {
  try {
    const [dbStatus] = await pool.query('SELECT 1 + 1 AS result');
    res.json({
      status: 'operational',
      dbStatus: dbStatus[0].result === 2 ? 'OK' : 'ERROR'
    });
  } catch (error) {
    res.status(500).json({ status: 'database_error' });
  }
});

// Rutas Protegidas
apiRouter.use('/usuarios', require('./routes/usuarios'));
apiRouter.use('/marcas', require('./routes/marcas'));
apiRouter.use('/productos', require('./routes/productos'));
apiRouter.use('/categorias', require('./routes/categorias'));
apiRouter.use('/carrito', require('./routes/carritos'));
apiRouter.use('/sucursales', require('./routes/sucursal'));
apiRouter.use('/promociones', require('./routes/promocion'));
apiRouter.use('/ventas', require('./routes/ventas'));
apiRouter.use('/tarjetas', require('./routes/tarjeta'));



// Montar todas las rutas bajo /api/v1
app.use('/api/v1', apiRouter);

// 7. Manejo de errores
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    endpoint: req.originalUrl
  });
});

app.use(errorHandler);

// 8. Inicio del servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

module.exports = app;
