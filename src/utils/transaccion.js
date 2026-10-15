const pool = require('../config/db');

// Ejecuta fn(db) dentro de una transacción; db es la conexión que deben usar los repositorios.
async function conTransaccion(fn) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await fn(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

module.exports = conTransaccion;
