require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpayRoutes = require('./routes/webpay.routes');

const app = express();

// Configuración de middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Middleware de logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas (cambiado de /api/webpay a /transbank/webpay)
app.use('/transbank/webpay', webpayRoutes);

// Endpoint de prueba (cambiado de /api/ping a /transbank/ping)
app.get('/transbank/ping', (req, res) => {
  res.json({
    status: 'active',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nServidor Webpay iniciado en http://localhost:${PORT}`);
  console.log(`Endpoint de prueba: http://localhost:${PORT}/transbank/ping`);
  console.log(`Endpoints Webpay:`);
  console.log(`- POST http://localhost:${PORT}/transbank/webpay/create`);
  console.log(`- POST http://localhost:${PORT}/transbank/webpay/commit`);
  console.log(`- GET  http://localhost:${PORT}/transbank/webpay/status/:token\n`);
});