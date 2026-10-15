const pool = require('../config/db');

async function obtenerTodos() {
  const [filas] = await pool.query(
    'SELECT package_id, name, included_classes, price FROM packages'
  );
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(
    'SELECT package_id, name, included_classes, price FROM packages WHERE package_id = ?',
    [id]
  );
  return filas[0];
}

module.exports = { obtenerTodos, obtenerPorId };