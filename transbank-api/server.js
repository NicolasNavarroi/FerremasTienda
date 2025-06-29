require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpayRoutes = require('./routes/webpay.routes'); // Asegúrate de que este archivo contenga solo un router

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Rutas de Webpay
app.use('/transbank/webpay', webpayRoutes);

// ✅ Endpoint de prueba
app.get('/transbank/ping', (req, res) => {
  res.json({
    status: 'active',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date()
  });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor Webpay iniciado en http://localhost:${PORT}`);
  console.log(`🔄 Endpoint de prueba: http://localhost:${PORT}/transbank/ping`);
  console.log(`🔗 Endpoints Webpay:`);
  console.log(`- POST http://localhost:${PORT}/transbank/webpay/create`);
  console.log(`- POST http://localhost:${PORT}/transbank/webpay/commit`);
  console.log(`- GET  http://localhost:${PORT}/transbank/webpay/status/:token\n`);
});
