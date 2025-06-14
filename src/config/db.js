require('dotenv').config();
const mysql = require('mysql2/promise'); // Usar la versión promise-based

// Configuración mejorada con pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null, // Para contraseña vacía
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexiones
  queueLimit: 0,
  timezone: 'local' // Asegura la zona horaria correcta
});

// Verificación de conexión al iniciar
pool.getConnection()
  .then((conn) => {
    console.log('✅ Conectado a MySQL en', process.env.DB_HOST);
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Error de conexión a MySQL:', {
      message: err.message,
      code: err.code
    });
    process.exit(1); // Salir si no hay conexión
  });

// Manejo de errores de conexión
pool.on('error', (err) => {
  console.error('⚠️ Error en la conexión MySQL:', err.message);
});

module.exports = pool;