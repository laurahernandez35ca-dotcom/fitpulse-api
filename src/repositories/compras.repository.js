const pool = require('../config/db');

const BASE = `SELECT pu.purchase_id, pu.user_id, u.name AS user_name, pu.package_id,
                     pk.name AS package_name, pu.purchase_date, pu.paid_price
              FROM purchases pu
              JOIN users u ON u.user_id = pu.user_id
              JOIN packages pk ON pk.package_id = pu.package_id`;

async function listar({ userId } = {}) {
  const where = userId ? ' WHERE pu.user_id = ?' : '';
  const [filas] = await pool.query(`${BASE}${where} ORDER BY pu.purchase_date DESC`, userId ? [userId] : []);
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(`${BASE} WHERE pu.purchase_id = ?`, [id]);
  return filas[0];
}

async function crear({ userId, packageId, paidPrice }) {
  const [resultado] = await pool.query(
    'INSERT INTO purchases (user_id, package_id, purchase_date, paid_price) VALUES (?, ?, NOW(), ?)',
    [userId, packageId, paidPrice]
  );
  return resultado.insertId;
}

// Si no se envía fecha, MySQL usa el día actual
async function resolverFecha(fecha) {
  const [filas] = await pool.query("SELECT DATE_FORMAT(COALESCE(?, CURDATE()), '%Y-%m-%d') AS dia", [
    fecha || null
  ]);
  return filas[0].dia;
}

// Resumen tomado de la vista daily_sales definida en el modelo de datos
async function resumenDelDia(dia) {
  const [filas] = await pool.query(
    'SELECT sale_date, total_purchases, total_sales FROM daily_sales WHERE sale_date = ?',
    [dia]
  );
  return filas[0];
}

async function detalleDelDia(dia) {
  const [filas] = await pool.query(`${BASE} WHERE DATE(pu.purchase_date) = ? ORDER BY pu.purchase_date`, [dia]);
  return filas;
}

module.exports = { listar, obtenerPorId, crear, resolverFecha, resumenDelDia, detalleDelDia };
