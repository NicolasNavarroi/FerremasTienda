require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { createServer } = require('http');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');

// Importación de TODAS las rutas (faltaban estas)
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarios');
const marcaRoutes = require('./routes/marcas');
const productoRoutes = require('./routes/productos');
const categoriaRoutes = require('./routes/categorias');
const carritoRoutes = require('./routes/carritos');
const sucursalRoutes = require('./routes/sucursal');
const promocionRoutes = require('./routes/promocion');
const ventaRoutes = require('./routes/ventas');
const tarjetaRoutes = require('./routes/tarjeta'); // Faltaba
const dolarRoutes = require('./routes/dolar'); // Faltaba

const app = express();
const httpServer = createServer(app);

// 1. Configuración de Seguridad Mejorada
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

// 2. CORS Configurado para Postman y Frontend
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',') 
    : '*', // Permitir Postman y otros clientes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Logging Mejorado
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 4. Body Parsers con límites aumentados
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Archivos estáticos con caché
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '7d'
}));

// 6. Sistema de Rutas Versionado
const apiRouter = express.Router();

// Rutas Públicas
apiRouter.use('/auth', authRoutes);
apiRouter.use('/dolar', dolarRoutes); // Nueva ruta para cotización

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

// Rutas Protegidas (todas las demás)
apiRouter.use('/usuarios', usuarioRoutes);
apiRouter.use('/marcas', marcaRoutes);
apiRouter.use('/productos', productoRoutes);
apiRouter.use('/categorias', categoriaRoutes);
apiRouter.use('/carrito', carritoRoutes);
apiRouter.use('/sucursales', sucursalRoutes);
apiRouter.use('/promociones', promocionRoutes);
apiRouter.use('/ventas', ventaRoutes);
apiRouter.use('/tarjetas', tarjetaRoutes); // Nueva ruta para tarjetas

// Montar todas las rutas bajo /api/v1
app.use('/api/v1', apiRouter);

// 7. Manejo de Errores y 404
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    availableEndpoints: [
      '/api/v1/auth/login',
      '/api/v1/productos',
      '/api/v1/ventas',
      // Listar otros endpoints importantes
    ]
  });
});

app.use(errorHandler);

// 8. Inicio del Servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

// 9. Exportar para testing
module.exports = app;