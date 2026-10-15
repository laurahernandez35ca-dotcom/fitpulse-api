require('dotenv').config({ quiet: true });
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await pool.query('SELECT 1');
    console.log('Conectado a MySQL');
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No se pudo conectar a MySQL:', error.message);
  }
}

iniciar();