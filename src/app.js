const express = require('express');
const app = express();

app.use(express.json()); // Para parsear JSON

// Rutas
app.use('/api/usuarios', require('./src/routes/usuarios'));
// ... otras rutas

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});